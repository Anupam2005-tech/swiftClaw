import base64
import math
import re
import struct
import tiktoken
from langchain_core.messages import BaseMessage, SystemMessage
from typing import List, Tuple
import structlog

logger = structlog.get_logger(__name__)

# Fallback values for characters-to-tokens estimation if tokenizers fail
CHARS_PER_TOKEN_MAP = {
    "openai": 4.0,
    "gemini": 4.0,
    "groq": 3.8,
    "nvidia": 4.0,
}

def get_image_dimensions(image_url_or_base64: str) -> Tuple[int, int]:
    """
    Decodes the image header from base64 content and attempts to extract
    its dimensions (width, height) without any heavy external dependencies.
    Supports PNG, JPEG, GIF, and WebP.
    Returns (1024, 1024) as default fallback if parsing fails.
    """
    default_dims = (1024, 1024)
    base64_data = image_url_or_base64
    
    # Strip data URL prefix if present
    if image_url_or_base64.startswith("data:"):
        match = re.match(r"data:image/.+?;base64,(.+)", image_url_or_base64)
        if match:
            base64_data = match.group(1)
        else:
            return default_dims
            
    try:
        # Decode first 1024 bytes which contains header info
        padding = "=" * ((4 - len(base64_data[:1024]) % 4) % 4)
        raw_bytes = base64.b64decode(base64_data[:1024] + padding, validate=False)
    except Exception:
        return default_dims

    if not raw_bytes:
        return default_dims

    try:
        # 1. PNG Image Header
        if raw_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            # IHDR starts at byte 12, width (4 bytes) and height (4 bytes) at 16
            width, height = struct.unpack(">II", raw_bytes[16:24])
            return width, height

        # 2. GIF Image Header
        elif raw_bytes.startswith(b"GIF87a") or raw_bytes.startswith(b"GIF89a"):
            # Width and height are 2-byte little-endian at offset 6
            width, height = struct.unpack("<HH", raw_bytes[6:10])
            return width, height

        # 3. JPEG Image Header
        elif raw_bytes.startswith(b"\xff\xd8"):
            idx = 2
            while idx < len(raw_bytes):
                if idx + 2 > len(raw_bytes):
                    break
                marker = raw_bytes[idx:idx+2]
                if not marker.startswith(b"\xff"):
                    break
                
                marker_type = marker[1]
                # Standalone markers with no payload (no length field)
                # 0xD0 - 0xD7 are RST0-RST7, 0xD8 is SOI, 0xD9 is EOI, 0x01 is TEM
                if marker_type in (0xd8, 0xd9, 0x01) or (0xd0 <= marker_type <= 0xd7):
                    idx += 2
                    continue
                
                # Check for bounds before reading length
                if idx + 4 > len(raw_bytes):
                    break
                    
                # SOF0 (0xFFC0), SOF2 (0xFFC2) contain image sizes
                if marker_type in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
                    if idx + 9 <= len(raw_bytes):
                        height, width = struct.unpack(">HH", raw_bytes[idx+5:idx+9])
                        return width, height
                    break
                else:
                    segment_len = struct.unpack(">H", raw_bytes[idx+2:idx+4])[0]
                    idx += 2 + segment_len

        # 4. WebP / RIFF Image Header
        elif raw_bytes.startswith(b"RIFF") and len(raw_bytes) > 30 and raw_bytes[8:12] == b"WEBP":
            vp8 = raw_bytes[12:16]
            if vp8 == b"VP8 ": # Lossy
                width, height = struct.unpack("<HH", raw_bytes[26:30])
                return width & 0x3FFF, height & 0x3FFF
            elif vp8 == b"VP8L": # Lossless
                b = raw_bytes[21:25]
                val = b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)
                width = (val & 0x3FFF) + 1
                height = ((val >> 14) & 0x3FFF) + 1
                return width, height
            elif vp8 == b"VP8X": # Extended
                w_bytes = raw_bytes[24:27]
                h_bytes = raw_bytes[27:30]
                width = w_bytes[0] | (w_bytes[1] << 8) | (w_bytes[2] << 16)
                height = h_bytes[0] | (h_bytes[1] << 8) | (h_bytes[2] << 16)
                return width + 1, height + 1
    except Exception as e:
        logger.debug("image_dimension_parse_failed", error=str(e))

    return default_dims

def calculate_openai_image_tokens(width: int, height: int, detail: str = "high") -> int:
    """Calculates OpenAI vision tokens based on image size and detail level."""
    if detail == "low":
        return 85
        
    if width <= 0 or height <= 0:
        return 85  # Safe fallback if dimensions are zero/negative

    # Scale shortest side to 768px
    if width < height:
        scale = 768.0 / width
    else:
        scale = 768.0 / height
    
    w = width * scale
    h = height * scale
    
    # Scale down if longest side exceeds 2048px
    if w > 2048 or h > 2048:
        if w > h:
            scale_2048 = 2048.0 / w
        else:
            scale_2048 = 2048.0 / h
        w *= scale_2048
        h *= scale_2048
        
    tiles_x = math.ceil(w / 512.0)
    tiles_y = math.ceil(h / 512.0)
    return int((tiles_x * tiles_y) * 170 + 85)

def estimate_image_tokens(image_data: str, provider: str, model_name: str, detail: str = "high") -> int:
    """Calculates image tokens dynamically for each provider based on dimension rules."""
    width, height = get_image_dimensions(image_data)
    
    provider_lower = provider.lower()
    model_lower = model_name.lower()
    
    if width <= 0 or height <= 0:
        return 85 if provider_lower == "openai" and detail == "low" else 800

    if provider_lower == "openai":
        return calculate_openai_image_tokens(width, height, detail)
        
    elif provider_lower == "gemini":
        if "flash" in model_lower:
            return 258
        else:  # Pro models use tile-based (approx 768x768 tiles)
            w_tiles = math.ceil(width / 768.0)
            h_tiles = math.ceil(height / 768.0)
            return int(w_tiles * h_tiles * 258)
            
    elif provider_lower == "groq":
        # Groq Llama 3.2 Vision uses 1600 tokens standard
        return 1600
        
    elif provider_lower == "nvidia":
        # Default safety vision budget
        return 1000
        
    return 800

def parse_provider_and_model(model_str: str) -> Tuple[str, str]:
    """Helper to parse a 'provider:model' string or fallback to default."""
    if not model_str:
        return "openai", "gpt-4o"
    if ":" in model_str:
        provider, model_name = model_str.split(":", 1)
        return provider.strip().lower(), model_name.strip()
    # Simple fallback detection
    model_lower = model_str.lower()
    if "gemini" in model_lower:
        return "gemini", model_str
    if "llama" in model_lower or "mixtral" in model_lower:
        return "groq", model_str
    if "nv-" in model_lower:
        return "nvidia", model_str
    return "openai", model_str

def estimate_tokens(text: str, model: str = "openai:gpt-4o") -> int:
    """
    Estimates the number of tokens in a text using the appropriate
    tokenizer mapping for the active provider.
    """
    if not text:
        return 0
        
    provider, model_name = parse_provider_and_model(model)
    
    try:
        # Determine the encoding based on model name
        if provider == "openai":
            # Map newer gpt-4o/o1 models to o200k_base, older to cl100k_base
            model_lower = model_name.lower()
            if any(x in model_lower for x in ["gpt-4o", "o1", "o3"]):
                try:
                    encoding = tiktoken.get_encoding("o200k_base")
                except Exception:
                    encoding = tiktoken.encoding_for_model("gpt-4")
            else:
                try:
                    encoding = tiktoken.encoding_for_model(model_name)
                except Exception:
                    encoding = tiktoken.get_encoding("cl100k_base")
            return len(encoding.encode(text))
            
        elif provider in ["gemini", "groq", "nvidia"]:
            # Standard tiktoken cl100k_base matches modern tokenizers closely
            encoding = tiktoken.get_encoding("cl100k_base")
            tiktoken_count = len(encoding.encode(text))
            
            # Combine with character density estimation for maximum safety
            char_ratio = CHARS_PER_TOKEN_MAP.get(provider, 4.0)
            char_estimate = int(len(text) / char_ratio)
            
            # Return slightly padded/safe estimate
            return max(tiktoken_count, char_estimate)
            
    except Exception as e:
        logger.debug("token_estimation_failed_using_fallback", error=str(e), provider=provider)
        
    # Reliable character-based fallback
    ratio = CHARS_PER_TOKEN_MAP.get(provider, 4.0)
    return max(1, int(len(text) / ratio))

def estimate_message_tokens(msg: BaseMessage, model: str = "openai:gpt-4o") -> int:
    """Estimates tokens for a LangChain message, accurately parsing vision blocks."""
    provider, model_name = parse_provider_and_model(model)
    
    if isinstance(msg.content, str):
        # Additional small metadata token overhead per message (role + start/end tokens)
        return estimate_tokens(msg.content, model) + 4
        
    elif isinstance(msg.content, list):
        total = 4
        for block in msg.content:
            if isinstance(block, dict):
                block_type = block.get("type", "")
                if block_type == "text":
                    total += estimate_tokens(block.get("text", ""), model)
                elif block_type == "image_url":
                    img_val = block.get("image_url", {})
                    # URL could be nested or plain string
                    url_str = ""
                    detail = "high"
                    if isinstance(img_val, dict):
                        url_str = img_val.get("url", "")
                        detail = img_val.get("detail", "high")
                    elif isinstance(img_val, str):
                        url_str = img_val
                    
                    if url_str:
                        total += estimate_image_tokens(url_str, provider, model_name, detail)
            elif isinstance(block, str):
                total += estimate_tokens(block, model)
        return total
        
    return 4

def assemble_context_with_budget(
    system_prompt: str,
    rolling_summary: str,
    history: List[BaseMessage],
    current_message: BaseMessage,
    max_tokens: int,
    model: str = "openai:gpt-4o"
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
    
    # Guard against base_tokens + current_tokens alone exceeding target_budget
    if remaining_budget < 0:
        logger.warning(
            "context_budget_exceeded_by_base_and_current",
            target_budget=target_budget,
            base_tokens=base_tokens,
            current_tokens=current_tokens
        )
        return base_messages + [current_message]
    
    # Truncate history from the end (most recent first) to fit within remaining budget
    allowed_history: List[BaseMessage] = []
    accumulated_tokens = 0
    
    for msg in reversed(history):
        msg_tokens = estimate_message_tokens(msg, model)
        if accumulated_tokens + msg_tokens > remaining_budget:
            logger.warning(
                "history_truncated", 
                remaining_budget=remaining_budget, 
                accumulated_tokens=accumulated_tokens,
                truncated_at_msg_id=getattr(msg, "id", "unknown")
            )
            break
        allowed_history.insert(0, msg)
        accumulated_tokens += msg_tokens
        
    return base_messages + allowed_history + [current_message]
