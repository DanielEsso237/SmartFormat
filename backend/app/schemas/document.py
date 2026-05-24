from pydantic import BaseModel
from typing import Optional, List, Any, Dict


class CoverInfo(BaseModel):
    has_cover: bool = False
    cover_complete: bool = False      
    cover_partial: bool = False        
    missing_fields: List[str] = []
    extracted_data: Dict[str, Any] = {}


class DocumentAnalysis(BaseModel):
    document_type: str                
    title: str = ""
    cover_info: CoverInfo = CoverInfo()
    sections: List[Dict[str, Any]] = []   
    needs_form: bool = False


class FormField(BaseModel):
    name: str
    label: str
    type: str                      
    required: bool = False
    placeholder: str = ""
    options: Optional[List[str]] = None
    fields: Optional[List["FormField"]] = None 


class FormDefinition(BaseModel):
    doc_type: str
    title: str
    fields: List[FormField]



class FormatRequest(BaseModel):
    session_id: str
    form_data: Optional[Dict[str, Any]] = None 
    use_extracted_cover: bool = False             


class AnalyzeResponse(BaseModel):
    session_id: str
    analysis: DocumentAnalysis
    form_definition: Optional[FormDefinition] = None
    message: str = ""


class FormatResponse(BaseModel):
    session_id: str
    download_url: str
    filename: str
    document_type: str
    status: str = "success"
    message: str = ""
