import json
import os
from pathlib import Path
from typing import Dict, Optional
from app.core.providers.base import ProviderCapabilities

_registry: Dict[str, ProviderCapabilities] = {}

def load_registry() -> None:
    global _registry
    if _registry:
        return
        
    json_path = Path(__file__).parent / "capabilities.json"
    if not json_path.exists():
        raise FileNotFoundError(f"Capabilities registry not found at {json_path}")
        
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for key, val in data.items():
        _registry[key] = ProviderCapabilities(**val)

def get_capabilities(provider: str, model: str) -> Optional[ProviderCapabilities]:
    if not _registry:
        load_registry()
    
    key = f"{provider}:{model}"
    return _registry.get(key)
