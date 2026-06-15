import tiktoken
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from typing import List, Tuple
import structlog

logger = structlog.get_logger(__name__)

def estimate_tokens(text: str, model: str = "gpt-4o") -> int:
    """Estimates the number of tokens in a text using tiktoken."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except Exception:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def estimate_message_tokens(msg: BaseMessage, model: str = "gpt-4o") -> int:
    if isinstance(msg.content, str):
        return estimate_tokens(msg.content, model)
    elif isinstance(msg.content, list):
        # Handle list content (e.g., vision blocks)
        total = 0
        for block in msg.content:
            if isinstance(block, dict) and block.get("type") == "text":
                total += estimate_tokens(block.get("text", ""), model)
            elif isinstance(block, dict) and block.get("type") == "image_url":
                # Rough vision token estimate
                total += 800
        return total
    return 0

def assemble_context_with_budget(
    system_prompt: str,
    rolling_summary: str,
    history: List[BaseMessage],
    current_message: BaseMessage,
    max_tokens: int,
    model: str = "gpt-4o"
) -> List[BaseMessage]:
    """
    Assembles context matching the two-layer truncation strategy.
    Target budget is 80% of max_tokens.
    Includes system prompt, rolling summary (layer 1), and recent history (layer 2) truncated to fit.
    """
    target_budget = int(max_tokens * 0.8)
    
    # Calculate base tokens (system prompt, current message, rolling summary if present)
    base_messages = [SystemMessage(content=system_prompt)]
    if rolling_summary:
        base_messages.append(SystemMessage(content=f"Summary of previous conversation: {rolling_summary}"))
        
    base_tokens = sum(estimate_message_tokens(m, model) for m in base_messages)
    current_tokens = estimate_message_tokens(current_message, model)
    
    remaining_budget = target_budget - (base_tokens + current_tokens)
    
    # Truncate history from the end (most recent first) to fit within remaining budget
    allowed_history: List[BaseMessage] = []
    accumulated_tokens = 0
    
    for msg in reversed(history):
        msg_tokens = estimate_message_tokens(msg, model)
        if accumulated_tokens + msg_tokens > remaining_budget:
            logger.warn("history_truncated", remaining_budget=remaining_budget, accumulated_tokens=accumulated_tokens)
            break
        allowed_history.insert(0, msg)
        accumulated_tokens += msg_tokens
        
    return base_messages + allowed_history + [current_message]
