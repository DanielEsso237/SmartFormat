from pydantic import BaseModel
from typing import Optional

class DocumentUploadResponse(BaseModel):
    filename: str
    original_name: str
    file_type: str
    status: str
    message: str
    download_url: Optional[str] = None
    document_type: Optional[str] = None