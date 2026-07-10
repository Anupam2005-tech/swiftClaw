import time
import threading
from typing import Dict, Tuple, Any

class SimpleTTLCache:
    def __init__(self, ttl_seconds: int):
        self.ttl = ttl_seconds
        self.cache: Dict[str, Tuple[float, Any]] = {}
        self.lock = threading.Lock()

    def get(self, key: str) -> Any:
        now = time.time()
        with self.lock:
            if key in self.cache:
                expiry, val = self.cache[key]
                if now < expiry:
                    return val
                else:
                    del self.cache[key]
        return None

    def set(self, key: str, value: Any):
        with self.lock:
            self.cache[key] = (time.time() + self.ttl, value)

    def invalidate(self, key: str):
        with self.lock:
            self.cache.pop(key, None)

    def clear(self):
        with self.lock:
            self.cache.clear()

# Instantiate caches
# Cache decoded tokens mapping JWT token -> UID (valid for 10 minutes)
token_cache = SimpleTTLCache(ttl_seconds=600)

# Cache session validity mapping uid:session_id -> boolean (valid for 5 minutes)
session_cache = SimpleTTLCache(ttl_seconds=300)
