from datetime import datetime, timezone
from app.db.firestore import db
import uuid

def create_conversation_doc(uid: str, conversation_id: str, title: str = "New Conversation") -> None:
    conv_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id)
    now = datetime.now(timezone.utc)
    conv_ref.set({
        "title": title,
        "created_at": now,
        "updated_at": now,
        "summary": "",
        "metadata": {}
    })

def add_message_doc(uid: str, conversation_id: str, role: str, content: str, status: str = "completed", metadata: dict = None) -> str:
    msg_id = str(uuid.uuid4())
    msg_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id).collection("messages").document(msg_id)
    
    now = datetime.now(timezone.utc)
    msg_ref.set({
        "role": role,
        "content": content,
        "created_at": now,
        "status": status,
        "metadata": metadata or {}
    })
    
    # Update conversation updated_at
    db.collection("users").document(uid).collection("conversations").document(conversation_id).update({
        "updated_at": now
    })
    
    return msg_id

def get_conversation_history(uid: str, conversation_id: str, limit: int = 50) -> list[dict]:
    messages_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id).collection("messages")
    docs = messages_ref.order_by("created_at").limit(limit).stream()
    
    history = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        history.append(data)
    return history

def list_conversations(uid: str, limit: int = 20) -> list[dict]:
    conv_ref = db.collection("users").document(uid).collection("conversations")
    docs = conv_ref.order_by("updated_at", direction="DESCENDING").limit(limit).stream()
    
    conversations = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        conversations.append(data)
    return conversations

def get_conversation_summary(uid: str, conversation_id: str) -> str:
    """Reads the rolling summary stored on a conversation document."""
    conv_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id)
    doc = conv_ref.get()
    if doc.exists:
        return doc.to_dict().get("summary", "")
    return ""

def delete_conversation_doc(uid: str, conversation_id: str) -> None:
    # Delete messages subcollection in paginated batches (Firestore max 500 ops per batch)
    messages_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id).collection("messages")
    
    while True:
        docs = list(messages_ref.limit(500).stream())
        if not docs:
            break
        batch = db.batch()
        for doc in docs:
            batch.delete(doc.reference)
        batch.commit()
    
    # Delete main conversation doc
    db.collection("users").document(uid).collection("conversations").document(conversation_id).delete()
