import uuid
import boto3
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse
from app.config import settings
from app.core.auth.middleware import get_current_user
from typing import Dict, Any

router = APIRouter(tags=["upload"])

def get_s3_client():
    if not all([settings.r2_account_id, settings.r2_access_key_id, settings.r2_secret_access_key, settings.r2_bucket_name]):
        raise HTTPException(status_code=500, detail="Cloudflare R2 is not configured")
        
    return boto3.client(
        's3',
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto"
    )

@router.post("")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    conversation_id: str = Form(...),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    uid = current_user["uid"]
    try:
        s3 = get_s3_client()
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    content = await file.read()
    
    if len(content) > settings.max_upload_size_bytes:
        raise HTTPException(status_code=400, detail="File too large")
        
    ext = file.filename.split('.')[-1] if '.' in file.filename else ''
    filename = f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex
    
    # Construct R2 object key
    object_key = f"uploads/{uid}/{conversation_id}/{filename}"
    
    try:
        s3.put_object(
            Bucket=settings.r2_bucket_name,
            Key=object_key,
            Body=content,
            ContentType=file.content_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to R2: {str(e)}")
        
    # Construct URL pointing to our local proxy endpoint
    base_url = str(request.base_url).rstrip('/')
    # If the request came through a proxy or localhost, ensure we keep the correct scheme/host
    url = f"{base_url}/api/upload/file/{object_key}"
        
    return {
        "url": url,
        "object_key": object_key,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content)
    }

@router.get("/file/{object_key:path}")
async def get_file(object_key: str):
    try:
        s3 = get_s3_client()
        # Fetch object from R2
        response = s3.get_object(Bucket=settings.r2_bucket_name, Key=object_key)
        
        # Stream it back to the client
        return StreamingResponse(
            io.BytesIO(response['Body'].read()),
            media_type=response.get('ContentType', 'application/octet-stream')
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found or R2 error")
