from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.schemas.document import DocumentUploadResponse
from app.services.document_service import process_document

router = APIRouter()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(('.docx', '.pdf')):
        raise HTTPException(status_code=400, detail="Seuls les fichiers .docx et .pdf sont acceptés")
    
    try:
        result = await process_document(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))