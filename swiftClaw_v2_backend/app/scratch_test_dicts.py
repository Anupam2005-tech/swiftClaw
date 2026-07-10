import asyncio
from app.db.firestore import db
from app.core.vault.vault import get_api_key
from langchain_google_genai import ChatGoogleGenerativeAI

async def main():
    uid = "u0ABjeM9UaQ8VQzEzoU99ik2z8Q2"
    key = get_api_key(uid, "gemini")
    if not key:
        print("No Gemini API key")
        return

    tiny_gif_b64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=key,
    )
    
    # Format messages exactly as generator_node formats them:
    formatted_messages = [
        {
            "role": "user", 
            "content": [
                {"type": "text", "text": "Is this a tiny image? Answer in one word."},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/gif;base64,{tiny_gif_b64}"},
                }
            ]
        }
    ]
    
    print("Testing with formatted messages (dict list with image_url)...")
    try:
        resp = await llm.ainvoke(formatted_messages)
        print(f"Success! Response: {resp.content}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
