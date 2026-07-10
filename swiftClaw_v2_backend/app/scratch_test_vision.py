import asyncio
import base64
from app.db.firestore import db
from app.core.vault.vault import get_api_key
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

async def main():
    uid = "u0ABjeM9UaQ8VQzEzoU99ik2z8Q2"
    key = get_api_key(uid, "gemini")
    if not key:
        print("No Gemini API key found.")
        return

    # Tiny 1x1 black GIF image base64
    tiny_gif_b64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    
    # We will try with ChatGoogleGenerativeAI using the standard LangChain format (image_url)
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=key,
    )
    
    message_image_url = HumanMessage(
        content=[
            {"type": "text", "text": "Is this a tiny image? Answer in one word."},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/gif;base64,{tiny_gif_b64}"},
            },
        ]
    )
    
    print("Testing standard image_url format...")
    try:
        resp = await llm.ainvoke([message_image_url])
        print(f"Success! Response: {resp.content}")
    except Exception as e:
        print(f"Failed with image_url format: {e}")
        
    # Now let's try converting it or passing it in some other format
    # Let's try converting messages with the _convert_to_gemini_messages function logic:
    from app.core.providers.factory import GeminiAdapter
    formatted_msg = {"role": "user", "content": [
        {"type": "text", "text": "Is this a tiny image? Answer in one word."},
        {
            "type": "image_url",
            "image_url": {"url": f"data:image/gif;base64,{tiny_gif_b64}"},
        },
    ]}
    
    converted = GeminiAdapter._convert_to_gemini_messages([formatted_msg])
    print(f"Converted messages content: {converted}")
    
    print("Testing ChatGoogleGenerativeAI directly with converted list of dicts...")
    try:
        resp = await llm.ainvoke(converted)
        print(f"Success with converted list of dicts! Response: {resp.content}")
    except Exception as e:
        print(f"Failed with converted list of dicts: {e}")

if __name__ == "__main__":
    asyncio.run(main())
