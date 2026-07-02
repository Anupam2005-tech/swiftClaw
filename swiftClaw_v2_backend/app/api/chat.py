import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel

from app.core.auth.middleware import get_current_user
from app.core.agent.graph import agent_graph
from app.core.agent.vault_loader import populate_user_context
from app.core.context.files import validate_and_process_file
from app.core.context.truncation import assemble_context_with_budget, estimate_tokens
from app.core.context.summarizer import generate_rolling_summary
from app.db.conversations import (
    create_conversation_doc,
    add_message_doc,
    update_message_doc,
    get_conversation_history,
    get_conversation_summary,
    list_conversations,
    delete_conversation_doc,
    share_conversation_doc,
    get_shared_conversation_doc,
    pin_conversation_doc
)
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.core.providers.base import ProviderError
from app.core.providers.factory import get_adapter
from app.core.providers.model_discovery import get_cached_models
from app.core.vault.vault import get_api_key
from app.core.constants import SYSTEM_PROMPT
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter()

# Active streams registry to support stop capability
active_streams = {}

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    summary: str
    pinned: bool = False

@router.get("", response_model=List[ConversationResponse])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Lists recent conversations for the authenticated user."""
    uid = current_user["uid"]
    convs = list_conversations(uid)
    # Map fields
    result = []
    for c in convs:
        result.append(ConversationResponse(
            id=c["id"],
            title=c.get("title", "Untitled"),
            created_at=c.get("created_at"),
            updated_at=c.get("updated_at"),
            summary=c.get("summary", ""),
            pinned=c.get("pinned", False)
        ))
    return result

@router.get("/lobby-images")
async def get_lobby_images(current_user: dict = Depends(get_current_user)):
    """Retrieves all images created by LLM in response, grouped/ordered by date and time."""
    uid = current_user["uid"]
    convs = list_conversations(uid, limit=100)
    
    lobby_images = []
    for c in convs:
        conv_id = c["id"]
        conv_title = c.get("title", "Conversation")
        
        messages = get_conversation_history(uid, conv_id)
        
        last_user_prompt = ""
        for msg in messages:
            if msg.get("role") == "user":
                last_user_prompt = msg.get("content", "")
            elif msg.get("role") == "assistant" and msg.get("image_url"):
                lobby_images.append({
                    "id": msg["id"],
                    "conversation_id": conv_id,
                    "conversation_title": conv_title,
                    "image_url": msg["image_url"],
                    "created_at": msg.get("created_at"),
                    "prompt": last_user_prompt
                })
                
    def get_time(item):
        val = item.get("created_at")
        if isinstance(val, datetime):
            return val
        elif isinstance(val, str):
            try:
                return datetime.fromisoformat(val.replace("Z", "+00:00"))
            except ValueError:
                pass
        return datetime.min
        
    lobby_images.sort(key=get_time, reverse=True)
    
    for img in lobby_images:
        if isinstance(img["created_at"], datetime):
            img["created_at"] = img["created_at"].isoformat()
            
    return lobby_images

@router.get("/{conversation_id}/messages")
async def get_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieves conversation message history."""
    uid = current_user["uid"]
    messages = get_conversation_history(uid, conversation_id)
    return messages

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Deletes a conversation and all its messages."""
    uid = current_user["uid"]
    delete_conversation_doc(uid, conversation_id)

@router.post("/stop", status_code=status.HTTP_204_NO_CONTENT)
async def stop_stream(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Cancels an active stream for the given conversation ID."""
    uid = current_user["uid"]
    key = f"{uid}:{conversation_id}"
    if key in active_streams:
        active_streams[key].set()
        logger.info("stream_stop_requested", uid=uid, conversation_id=conversation_id)

@router.post("/stream")
async def stream_chat(
    conversation_id: str = Form(...),
    message: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
    web_search: bool = Form(False),
    user_message_id: Optional[str] = Form(None),
    assistant_message_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Main chat streaming endpoint. Accepts files and message, streams response as SSE,
    manages history, context window truncation, provider selection, and evaluation.
    """
    uid = current_user["uid"]
    session_id = current_user["session_id"]
    
    # 1. Parse and process files in-memory
    processed_files = []
    if files:
        for f in files:
            processed = await validate_and_process_file(f)
            processed_files.append(processed)
            
    # Determine task category deterministically
    task_category = "file_analysis" if processed_files else "chat"
    
    # 2. Setup user context and available providers
    user_context = populate_user_context(uid)
    available_providers = user_context["available_providers"]
    model_preferences = user_context["model_preferences"]
    
    if not available_providers or not model_preferences:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "onboarding_incomplete", "message": "You must complete onboarding (keys and preferences) first."}
        )
        
    # 3. Handle history assembly and context budget
    history = get_conversation_history(uid, conversation_id)
    
    # If conversation doesn't exist, create it
    if not history:
        create_conversation_doc(uid, conversation_id, title=message[:40] + "...")
        
    # Read rolling summary from previous conversation context
    rolling_summary = get_conversation_summary(uid, conversation_id) if history else ""
        
    user_idx = -1
    if user_message_id:
        for idx, m in enumerate(history):
            if m.get("id") == user_message_id:
                user_idx = idx
                break

    if user_message_id and user_idx != -1:
        update_message_doc(uid, conversation_id, user_message_id, message)
        # Re-fetch history since we updated a message
        history = get_conversation_history(uid, conversation_id)

    if user_message_id and user_idx != -1:
        history_for_context = history[:user_idx]
    else:
        history_for_context = history

    # Map Firestore history to LangChain messages, including file attachments
    lc_history = []
    for msg in history_for_context:
        role = msg.get("role")
        content = msg.get("content", "")
        attachments = msg.get("attachments")
        if role == "user":
            if attachments:
                parts = [{"type": "text", "text": content}]
                for att in attachments:
                    att_type = att.get("type", "")
                    att_content = att.get("content")
                    if att_type.startswith("image/") and att_content:
                        mime = att.get("mime_type") or att_type
                        parts.append({
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{att_content}"}
                        })
                    elif att_content:
                        parts.append({
                            "type": "text",
                            "text": f"\n[File: {att.get('name', 'unknown')}]\n\n{att_content}\n---"
                        })
                lc_history.append(HumanMessage(content=parts))
            else:
                lc_history.append(HumanMessage(content=content))
        elif role == "assistant":
            lc_history.append(AIMessage(content=content))
            
    # Incorporate files into user message content
    message_content = []
    image_blocks = []
    
    # Check if the current model supports vision
    supports_vision = True
    pref_model = model_preferences.get(task_category)
    if pref_model and ":" in pref_model:
        prov, mod = pref_model.split(":", 1)
        cached = get_cached_models(uid, prov)
        if cached:
            for m in cached:
                if m.get("id") == mod:
                    supports_vision = m.get("supports_vision", True)
                    break
    
    for pf in processed_files:
        if pf["type"] == "text":
            message_content.append(f"Content of uploaded file '{pf['filename']}':\n\n{pf['content']}\n---")
        elif pf["type"] == "image":
            if supports_vision:
                image_blocks.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{pf['mime_type']};base64,{pf['content']}"}
                })
            else:
                message_content.append(f"[An image '{pf['filename']}' was attached but the current model does not support vision.]")
            
    # Add user message
    message_content.append(message)
    full_user_message_str = "\n\n".join(message_content)
    
    # Build current message — multimodal if images are present
    if image_blocks:
        content_parts = [{"type": "text", "text": full_user_message_str}] + image_blocks
        current_message = HumanMessage(content=content_parts)
    else:
        current_message = HumanMessage(content=full_user_message_str)
    
    # Determine max context tokens from user's model cache
    SAFE_CONTEXT_FALLBACKS = {
        "openai": 128000,
        "gemini": 1048576,
        "groq": 131072,
        "nvidia": 128000,
    }
    max_context_tokens = 32768  # universal safe default
    pref_model = model_preferences.get(task_category)
    if pref_model and ":" in pref_model:
        prov, mod = pref_model.split(":", 1)
        max_context_tokens = SAFE_CONTEXT_FALLBACKS.get(prov, 32768)
        cached = get_cached_models(uid, prov)
        if cached:
            for m in cached:
                if m.get("id") == mod:
                    ctx_len = m.get("context_length")
                    if ctx_len is not None:
                        max_context_tokens = ctx_len
                    break
    
    assembled_messages = assemble_context_with_budget(
        system_prompt=SYSTEM_PROMPT,
        rolling_summary=rolling_summary,
        history=lc_history,
        current_message=current_message,
        max_tokens=max_context_tokens
    )
    
    # Inject web search results if enabled
    if web_search:
        try:
            from app.core.agent.tools.web_search import search_ddg
            results = search_ddg(message, max_results=5)
            if results and not results[0].get("error"):
                web_context_lines = []
                for r in results:
                    web_context_lines.append(
                        f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}"
                    )
                web_context = "\n\n---\n\n".join(web_context_lines)
                web_message = SystemMessage(
                    content=f"[Web Search Results for query: \"{message}\"]\n\n{web_context}\n\n[Use these results to answer the user's question if relevant. Do not mention the search results unless asked.]"
                )
                assembled_messages.insert(1, web_message)
        except Exception as e:
            logger.warning("web_search_injection_failed", error=str(e))
    
    # Save user message to DB with file attachments (if not updating an existing message)
    user_attachments = None
    if processed_files:
        user_attachments = [
            {
                "name": pf["filename"],
                "type": pf["mime_type"] if pf["type"] == "image" else "text/plain",
                "mime_type": pf["mime_type"],
                "size": pf.get("size", 0),
                "content": pf["content"]
            }
            for pf in processed_files
        ]
        
    if user_message_id and user_idx != -1:
        # Preserve or update attachments if necessary
        if processed_files:
            update_message_doc(uid, conversation_id, user_message_id, message, attachments=user_attachments)
    else:
        add_message_doc(uid, conversation_id, "user", message, attachments=user_attachments, message_id=user_message_id)
        if assistant_message_id:
            add_message_doc(uid, conversation_id, "assistant", "", status="streaming", message_id=assistant_message_id)
    
    # Prepare active stream flag
    cancel_flag = asyncio.Event()
    active_streams[f"{uid}:{conversation_id}"] = cancel_flag
    
    # Stream response generator
    async def event_generator():
        assistant_output = ""
        try:
            # We initialize the state dictionary
            initial_state = {
                "messages": assembled_messages,
                "task": message,
                "output": "",
                "evaluation": {},
                "retries": 0,
                "max_retries": 3,
                "critique": "",
                "provider_generator": "",
                "provider_evaluator": "",
                "session_id": session_id,
                "user_id": uid,
                "complexity": "medium",
                "task_category": task_category,
                "available_providers": available_providers,
                "model_preferences": model_preferences
            }
            
            queue = asyncio.Queue()
            
            # Streaming callback for the nodes
            async def stream_callback(chunk):
                await queue.put(chunk)
                
            # Run the LangGraph in the background
            async def run_graph():
                try:
                    await agent_graph.ainvoke(
                        initial_state,
                        config={"configurable": {"stream_callback": stream_callback}}
                    )
                except Exception as e:
                    logger.error("graph_execution_failed", error=str(e))
                    await queue.put({"type": "error", "message": str(e)})
                finally:
                    await queue.put({"type": "done"})
                    
            task_future = asyncio.create_task(run_graph())
            
            error_occurred = False
            error_message = ""
            while True:
                # Check for cancellation request
                if cancel_flag.is_set():
                    logger.info("stream_canceled_by_user", uid=uid)
                    task_future.cancel()
                    # Yield interrupt event
                    yield f"data: {json.dumps({'type': 'error', 'code': 'interrupted'})}\n\n"
                    break
                    
                try:
                    chunk = await asyncio.wait_for(queue.get(), timeout=0.1)
                except asyncio.TimeoutError:
                    continue
                    
                if chunk["type"] == "done":
                    break
                elif chunk["type"] == "error":
                    error_occurred = True
                    error_message = chunk.get("message") or "Something went wrong."
                    yield f"data: {json.dumps({'type': 'error', 'code': 'generation_error', 'message': error_message})}\n\n"
                    break
                elif chunk["type"] == "text":
                    assistant_output += chunk["content"]
                    yield f"data: {json.dumps({'type': 'text_delta', 'content': chunk['content']})}\n\n"
                elif chunk["type"] == "tool_call":
                    yield f"data: {json.dumps({'type': 'tool_call', 'tool': chunk['tool'], 'args': chunk['args']})}\n\n"
                    
            # 4. Save response to history and update rolling summary if needed
            if error_occurred:
                msg_status = "error"
                assistant_output = error_message
            else:
                msg_status = "interrupted" if cancel_flag.is_set() else "completed"

            if assistant_message_id:
                update_message_doc(uid, conversation_id, assistant_message_id, assistant_output, status=msg_status)
            else:
                add_message_doc(uid, conversation_id, "assistant", assistant_output, status=msg_status)
            
            # Check history size for summary trigger (every 20 messages)
            updated_history = get_conversation_history(uid, conversation_id)
            if len(updated_history) % 20 == 0:
                asyncio.create_task(generate_rolling_summary(uid, conversation_id, updated_history))
                
        except Exception as e:
            logger.error("stream_exception", error=str(e))
            yield f"data: {json.dumps({'type': 'error', 'code': 'internal_error', 'message': str(e)})}\n\n"
        finally:
            active_streams.pop(f"{uid}:{conversation_id}", None)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/{conversation_id}/share")
async def share_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Creates a public read-only snapshot of the conversation and returns metadata."""
    uid = current_user["uid"]
    share_info = share_conversation_doc(uid, conversation_id)
    if not share_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or could not be shared."
        )
    return share_info

@router.get("/shared/{conversation_id}")
async def get_shared_conversation(conversation_id: str):
    """Retrieves a public read-only snapshot of a shared conversation."""
    share_data = get_shared_conversation_doc(conversation_id)
    if not share_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared conversation not found."
        )
    return share_data

class PinRequest(BaseModel):
    pinned: bool

@router.post("/{conversation_id}/pin")
async def pin_conversation(conversation_id: str, req: PinRequest, current_user: dict = Depends(get_current_user)):
    """Pins or unpins a conversation."""
    uid = current_user["uid"]
    pin_conversation_doc(uid, conversation_id, req.pinned)
    return {"status": "success", "pinned": req.pinned}

