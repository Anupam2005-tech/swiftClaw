import io
import base64
from fastapi import UploadFile, HTTPException, status
from pypdf import PdfReader
from docx import Document as DocxDocument
import structlog

logger = structlog.get_logger(__name__)

ALLOWED_EXTENSIONS = {"pdf", "png", "jpeg", "jpg", "webp", "gif", "docx", "txt", "csv", "md"}
MAX_FILE_SIZE = 50 * 1024 * 1024 # 50MB

async def validate_and_process_file(file: UploadFile) -> dict:
    """
    Validates file extension and size, then extracts text or encodes image to base64.
    Returns: {"type": "text"|"image", "content": str, "filename": str, "mime_type": str}
    """
    filename = file.filename or "unknown"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={"code": "unsupported_file_type", "message": f"Extension .{ext} is not allowed."}
        )
        
    # Read content into memory (async to avoid blocking the event loop)
    content_bytes = await file.read()
    file_size = len(content_bytes)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={"code": "file_too_large", "message": f"File exceeds 50MB limit."}
        )
        
    mime_type = file.content_type or ""
    
    # Process images
    if ext in {"png", "jpeg", "jpg", "webp", "gif"}:
        b64_content = base64.b64encode(content_bytes).decode("utf-8")
        return {
            "type": "image",
            "content": b64_content,
            "filename": filename,
            "mime_type": mime_type
        }
        
    # Process text-based documents
    text_content = ""
    try:
        if ext == "pdf":
            pdf_file = io.BytesIO(content_bytes)
            reader = PdfReader(pdf_file)
            pages = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)
            text_content = "\n".join(pages)
            
        elif ext == "docx":
            docx_file = io.BytesIO(content_bytes)
            doc = DocxDocument(docx_file)
            text_content = "\n".join([p.text for p in doc.paragraphs])
            
        elif ext in {"txt", "csv", "md"}:
            text_content = content_bytes.decode("utf-8", errors="ignore")
            
        return {
            "type": "text",
            "content": text_content,
            "filename": filename,
            "mime_type": mime_type
        }
    except Exception as e:
        logger.error("file_processing_failed", filename=filename, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "file_processing_error", "message": f"Failed to parse file: {str(e)}"}
        )
