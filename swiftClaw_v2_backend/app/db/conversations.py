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

def add_message_doc(uid: str, conversation_id: str, role: str, content: str, status: str = "completed", metadata: dict = None, attachments: list[dict] = None, message_id: str = None) -> str:
    msg_id = message_id or str(uuid.uuid4())
    msg_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id).collection("messages").document(msg_id)
    
    now = datetime.now(timezone.utc)
    msg_doc = {
        "role": role,
        "content": content,
        "created_at": now,
        "status": status,
        "metadata": metadata or {}
    }
    if attachments:
        msg_doc["attachments"] = attachments
    
    msg_ref.set(msg_doc)
    
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

def list_conversations(uid: str, limit: int = 100) -> list[dict]:
    conv_ref = db.collection("users").document(uid).collection("conversations")
    docs = conv_ref.order_by("updated_at", direction="DESCENDING").limit(limit).stream()
    
    conversations = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        conversations.append(data)
    
    # Sort pinned first (True > False), then by updated_at descending
    conversations.sort(
        key=lambda x: (
            x.get("pinned", False),
            x.get("updated_at")
        ),
        reverse=True
    )
    return conversations

def pin_conversation_doc(uid: str, conversation_id: str, pinned: bool) -> None:
    doc_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id)
    doc = doc_ref.get()
    if not doc.exists:
        now = datetime.now(timezone.utc)
        doc_ref.set({
            "title": "New Conversation",
            "created_at": now,
            "updated_at": now,
            "summary": "",
            "metadata": {},
            "pinned": pinned
        })
    else:
        doc_ref.update({
            "pinned": pinned
        })

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

def update_message_doc(uid: str, conversation_id: str, message_id: str, content: str, status: str = "completed", metadata: dict = None, attachments: list[dict] = None) -> None:
    msg_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id).collection("messages").document(message_id)
    now = datetime.now(timezone.utc)
    msg_doc = {
        "content": content,
        "status": status,
    }
    if metadata is not None:
        msg_doc["metadata"] = metadata
    if attachments is not None:
        msg_doc["attachments"] = attachments
    msg_ref.update(msg_doc)
    
    # Update conversation updated_at
    db.collection("users").document(uid).collection("conversations").document(conversation_id).update({
        "updated_at": now
    })

def share_conversation_doc(uid: str, conversation_id: str) -> dict:
    # 1. Fetch conversation info
    conv_ref = db.collection("users").document(uid).collection("conversations").document(conversation_id)
    conv_doc = conv_ref.get()
    if not conv_doc.exists:
        return None
    conv_data = conv_doc.to_dict()
    
    # 2. Fetch all messages
    messages = get_conversation_history(uid, conversation_id, limit=100)
    
    # Format messages timestamps
    for msg in messages:
        for k, v in list(msg.items()):
            if isinstance(v, datetime):
                msg[k] = v.isoformat()
    
    # 3. Save to top-level 'shares' collection
    share_ref = db.collection("shares").document(conversation_id)
    share_ref.set({
        "title": conv_data.get("title", "Shared Conversation"),
        "created_at": datetime.now(timezone.utc),
        "owner_id": uid,
        "messages": messages
    })
    return {"id": conversation_id, "title": conv_data.get("title")}

def get_shared_conversation_doc(conversation_id: str) -> dict:
    share_ref = db.collection("shares").document(conversation_id)
    doc = share_ref.get()
    if doc.exists:
        data = doc.to_dict()
        if isinstance(data.get("created_at"), datetime):
            data["created_at"] = data["created_at"].isoformat()
        return data
    return None

