import asyncio
from app.db.firestore import db
from app.core.providers.model_discovery import discover_models
from app.core.vault.vault import get_api_key

async def main():
    # List users
    users = db.collection("users").get()
    print(f"Total users found: {len(users)}")
    for u in users:
        uid = u.id
        print(f"User ID: {uid}")
        # Get key for gemini
        key = get_api_key(uid, "gemini")
        if key:
            print("Gemini key found. Performing discovery...")
            try:
                models = await discover_models("gemini", key)
                print(f"Discovered {len(models)} Gemini models:")
                for m in models:
                    if "pro" in m["id"] or "flash" in m["id"]:
                        print(f"  Model ID: {m['id']}")
                        print(f"    Name: {m['name']}")
                        print(f"    Supports Vision: {m['supports_vision']}")
                        print(f"    Supports Tools: {m['supports_tools']}")
            except Exception as e:
                print(f"Error during discovery: {e}")
        else:
            print("No Gemini key found for user.")

if __name__ == "__main__":
    asyncio.run(main())
