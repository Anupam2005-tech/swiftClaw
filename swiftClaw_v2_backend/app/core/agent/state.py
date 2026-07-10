from typing import TypedDict, List, Literal, Optional, Dict, Any
from langchain_core.messages import BaseMessage

class EvaluationResult(TypedDict):
    """Result from evaluator node."""
    # pass is a Python keyword, so we define it as pass_ or use dict/TypedDict key access
    # Since it is a TypedDict, we can use "pass" string as key directly.
    pass_: bool # we can use "pass_" internally or map it, but let's expose it in TypedDict
    confidence: float
    critique: str

class AgentState(TypedDict):
    messages: List[BaseMessage]
    task: str
    output: str
    evaluation: Dict[str, Any]  # Contains {"pass": bool, "confidence": float, "critique": str}
    retries: int
    max_retries: int
    critique: str
    provider_generator: str
    model_generator: str
    provider_evaluator: str
    model_evaluator: str
    session_id: str
    user_id: str
    complexity: Literal["simple", "medium", "complex"]
    task_category: Literal[
        "chat", "web_search", "file_analysis", "image_analysis", 
        "image_generation", "video_analysis", "video_generation"
    ]
    available_providers: List[str]  # e.g., ["openai", "claude", "gemini"]
    model_preferences: Dict[str, str]  # mapping of task_category -> provider/model string
