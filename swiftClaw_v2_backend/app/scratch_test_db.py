import asyncio
from app.db.firestore import db
from app.core.providers.model_discovery import get_cached_models

async def main():
    uid = "u0ABjeM9UaQ8VQzEzoU99ik2z8Q2"
    doc = db.collection("users").document(uid).collection("model_cache").document("gemini").get()
    if doc.exists:
        data = doc.to_dict()
        print(f"Cached models count: {len(data.get('models', []))}")
        for m in data.get('models', []):
            if m.get("id") in ("gemini-2.5-pro", "gemini-2.5-flash", "gemini-3.5-flash"):
                print(f"Model {m.get('id')}: supports_vision={m.get('supports_vision')}, supports_tools={m.get('supports_tools')}")
    else:
        print("No gemini model cache found in Firestore.")

if __name__ == "__main__":
    asyncio.run(main())
