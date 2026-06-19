from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.core.auth.middleware import get_current_user
from app.db.firestore import db
from datetime import datetime, timezone
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter()


class MemoryImportRequest(BaseModel):
    content: str
    nickname: Optional[str] = None
    profession: Optional[str] = None


@router.post("/import")
async def import_memory(
    req: MemoryImportRequest,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user["uid"]

    memories_ref = db.collection("users").document(uid).collection("memories")
    memories_ref.add({
        "content": req.content,
        "nickname": req.nickname or "",
        "profession": req.profession or "",
        "created_at": datetime.now(timezone.utc),
    })

    logger.info("memory_imported", uid=uid, nickname=req.nickname, profession=req.profession)

    return {"success": True}
