from datetime import datetime, timezone
from google.cloud import firestore
from app.db.firestore import db
import uuid

def create_conversation_doc(uid: str, conversation_id: str, title: str = "New Conversation") -> None:
    conv_ref = db.collection("conversations").document(conversation_id)
    conv_ref.set({
        "title": title,
        "ownerId": uid,
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
        "summary": ""
    })

def add_message_doc(uid: str, conversation_id: str, role: str, content: str, status: str = "ok", metadata: dict = None, attachments: list[dict] = None, message_id: str = None, error_code: str = None) -> str:
    msg_id = message_id or str(uuid.uuid4())
    msg_ref = db.collection("conversations").document(conversation_id).collection("messages").document(msg_id)
    
    msg_doc = {
        "role": role,
        "content": content,
        "created_at": firestore.SERVER_TIMESTAMP,
        "status": status,
    }
    if metadata:
        msg_doc["metadata"] = metadata
    if attachments:
        msg_doc["attachments"] = attachments
    if error_code:
        msg_doc["errorCode"] = error_code
        
    msg_ref.set(msg_doc)
    
    # Update conversation updated_at
    db.collection("conversations").document(conversation_id).update({
        "updated_at": firestore.SERVER_TIMESTAMP
    })
    
    return msg_id

def get_conversation_history(uid: str, conversation_id: str, limit: int = 50) -> list[dict]:
    # Ensure ownerId matches, though we could just rely on backend auth checks before this
    messages_ref = db.collection("conversations").document(conversation_id).collection("messages")
    docs = messages_ref.order_by("created_at").limit(limit).stream()
    
    history = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        
        # Map short DB enums back to expected API values
        if data.get("role") == "u":
            data["role"] = "user"
        elif data.get("role") == "a":
            data["role"] = "assistant"
            
        if data.get("status") == "ok":
            data["status"] = "completed"
        elif data.get("status") == "failed":
            data["status"] = "error"
            
        # Convert timestamp for frontend if needed, but fastapi will serialize datetime objects
        history.append(data)
    return history

def list_conversations(uid: str, limit: int = 100) -> list[dict]:
    conv_ref = db.collection("conversations")
    # Requires a composite index for where and order_by
    docs = conv_ref.where("ownerId", "==", uid).order_by("updated_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
    
    conversations = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        conversations.append(data)
    
    # Sort pinned first (True > False), then by updated_at descending
    conversations.sort(
        key=lambda x: (
            x.get("pinned", False),
            x.get("updated_at") if isinstance(x.get("updated_at"), datetime) else datetime.min.replace(tzinfo=timezone.utc)
        ),
        reverse=True
    )
    return conversations

def pin_conversation_doc(uid: str, conversation_id: str, pinned: bool) -> None:
    doc_ref = db.collection("conversations").document(conversation_id)
    doc = doc_ref.get()
    if not doc.exists:
        doc_ref.set({
            "title": "New Conversation",
            "ownerId": uid,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
            "summary": "",
            "pinned": pinned
        })
    else:
        doc_ref.update({
            "pinned": pinned
        })

def get_conversation_summary(uid: str, conversation_id: str) -> str:
    """Reads the rolling summary stored on a conversation document."""
    conv_ref = db.collection("conversations").document(conversation_id)
    doc = conv_ref.get()
    if doc.exists:
        return doc.to_dict().get("summary", "")
    return ""

def delete_conversation_doc(uid: str, conversation_id: str) -> None:
    # Delete messages subcollection in paginated batches
    messages_ref = db.collection("conversations").document(conversation_id).collection("messages")
    
    while True:
        docs = list(messages_ref.limit(500).stream())
        if not docs:
            break
        batch = db.batch()
        for doc in docs:
            batch.delete(doc.reference)
        batch.commit()
    
    # Delete main conversation doc
    db.collection("conversations").document(conversation_id).delete()

def update_message_doc(uid: str, conversation_id: str, message_id: str, content: str, status: str = "ok", metadata: dict = None, attachments: list[dict] = None, error_code: str = None) -> None:
    msg_ref = db.collection("conversations").document(conversation_id).collection("messages").document(message_id)
    msg_doc = {
        "content": content,
        "status": status,
    }
    if metadata:
        msg_doc["metadata"] = metadata
    if attachments:
        msg_doc["attachments"] = attachments
    if error_code:
        msg_doc["errorCode"] = error_code
        
    msg_ref.update(msg_doc)
    
    # Update conversation updated_at
    db.collection("conversations").document(conversation_id).update({
        "updated_at": firestore.SERVER_TIMESTAMP
    })

def share_conversation_doc(uid: str, conversation_id: str) -> dict:
    conv_ref = db.collection("conversations").document(conversation_id)
    conv_doc = conv_ref.get()
    if not conv_doc.exists:
        return None
    conv_data = conv_doc.to_dict()
    
    messages = get_conversation_history(uid, conversation_id, limit=100)
    
    for msg in messages:
        for k, v in list(msg.items()):
            if isinstance(v, datetime):
                msg[k] = v.isoformat()
    
    share_ref = db.collection("shares").document(conversation_id)
    share_ref.set({
        "title": conv_data.get("title", "Shared Conversation"),
        "created_at": firestore.SERVER_TIMESTAMP,
        "owner_id": uid,
        "messages": messages
    })
    return {"id": conversation_id, "title": conv_data.get("title")}

def get_shared_conversation_doc(conversation_id: str) -> dict:
    share_ref = db.collection("shares").document(conversation_id)
    doc = share_ref.get()
    if doc.exists:
        data = doc.to_dict()
        if isinstance(data.get("created_at"), datetime):
            data["created_at"] = data["created_at"].isoformat()
        return data
    return None

