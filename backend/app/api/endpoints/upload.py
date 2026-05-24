import shutil
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.document import AnalyzeResponse, FormDefinition, FormField
from app.services.analysis_service import analyze_document
from app.services.session_service import create_session, update_session
from app.charte.forms import FORMS

router = APIRouter()
UPLOAD_DIR = Path("uploads")
ALLOWED_EXT = {".docx", ".pdf"}


def _build_form_definition(doc_type: str) -> FormDefinition | None:
    form_raw = FORMS.get(doc_type)
    if not form_raw:
        return None
    fields = [FormField(**f) for f in form_raw["fields"]]
    return FormDefinition(doc_type=doc_type, title=form_raw["title"], fields=fields)


@router.post("/upload", response_model=AnalyzeResponse)
async def upload_document(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXT:
        raise HTTPException(400, "Seuls les fichiers .docx et .pdf sont acceptés")

    UPLOAD_DIR.mkdir(exist_ok=True)

    import uuid
    unique_name = f"{uuid.uuid4().hex}{suffix}"
    save_path = UPLOAD_DIR / unique_name

    with open(save_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    sid = create_session(save_path, file.filename or unique_name)

    try:
        analysis = await analyze_document(save_path, file.filename or unique_name)
    except Exception as e:
        raise HTTPException(500, f"Erreur lors de l'analyse : {e}")

    update_session(sid, analysis=analysis)

    form_def: FormDefinition | None = None
    if analysis.needs_form or not analysis.cover_info.cover_complete:
        form_def = _build_form_definition(analysis.document_type)
        if form_def and analysis.cover_info.extracted_data:
            extracted = analysis.cover_info.extracted_data
            for field in form_def.fields:
                if field.name in extracted and extracted[field.name]:
                    field.placeholder = str(extracted[field.name])

    msg = ""
    if analysis.cover_info.cover_complete:
        msg = "Page de garde détectée et conservée."
    elif analysis.cover_info.cover_partial:
        msg = "Informations de couverture partiellement détectées. Veuillez compléter le formulaire."
    else:
        msg = "Aucune page de garde détectée. Veuillez remplir le formulaire."

    return AnalyzeResponse(
        session_id=sid,
        analysis=analysis,
        form_definition=form_def,
        message=msg,
    )
