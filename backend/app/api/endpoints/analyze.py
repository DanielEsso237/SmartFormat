from fastapi import APIRouter, HTTPException
from app.schemas.document import FormatRequest, FormatResponse, AnalyzeResponse
from app.services.session_service import get_session, update_session
from app.services.analysis_service import extract_text
from app.services.format_service import format_document
from pathlib import Path

router = APIRouter()
UPLOAD_DIR = Path("uploads")


@router.get("/analyze/{session_id}", response_model=AnalyzeResponse)
def get_analysis(session_id: str):
    session = get_session(session_id)
    if not session or not session.get("analysis"):
        raise HTTPException(404, "Session introuvable ou analyse non encore effectuée")

    from app.schemas.document import FormDefinition, FormField
    from app.charte.forms import FORMS

    analysis = session["analysis"]
    form_def = None
    if analysis.needs_form or not analysis.cover_info.cover_complete:
        form_raw = FORMS.get(analysis.document_type)
        if form_raw:
            fields = [FormField(**f) for f in form_raw["fields"]]
            form_def = FormDefinition(
                doc_type=analysis.document_type,
                title=form_raw["title"],
                fields=fields
            )

    return AnalyzeResponse(
        session_id=session_id,
        analysis=analysis,
        form_definition=form_def,
        message="Analyse disponible",
    )


@router.post("/format", response_model=FormatResponse)
async def format_doc(req: FormatRequest):
    session = get_session(req.session_id)
    if not session:
        raise HTTPException(404, "Session introuvable. Veuillez re-uploader le document.")

    analysis = session.get("analysis")
    if not analysis:
        raise HTTPException(400, "Analyse non disponible pour cette session.")

    if req.form_data:
        cover_data = req.form_data
    elif req.use_extracted_cover and analysis.cover_info.extracted_data:
        cover_data = analysis.cover_info.extracted_data
    else:
        cover_data = analysis.cover_info.extracted_data or {}

    update_session(req.session_id, form_data=cover_data)

    file_path: Path = session["file_path"]
    filename: str   = session["filename"]
    original_text = ""
    try:
        original_text = extract_text(file_path, filename)
    except Exception:
        pass

    output_name = f"smartformat_{req.session_id}.docx"
    output_path = UPLOAD_DIR / output_name

    try:
        format_document(
            analysis=analysis,
            form_data=cover_data,
            original_text=original_text,
            output_path=output_path,
        )
    except Exception as e:
        raise HTTPException(500, f"Erreur lors du formatage : {e}")

    return FormatResponse(
        session_id=req.session_id,
        download_url=f"/api/download/{output_name}",
        filename=output_name,
        document_type=analysis.document_type,
        status="success",
        message="Document formaté avec succès selon la charte FS-UEb",
    )
