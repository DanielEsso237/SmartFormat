from fastapi import APIRouter, HTTPException
from app.schemas.document import FormDefinition, FormField
from app.charte.forms import FORMS

router = APIRouter()


@router.get("/forms/{doc_type}", response_model=FormDefinition)
def get_form(doc_type: str):
    form_raw = FORMS.get(doc_type)
    if not form_raw:
        raise HTTPException(404, f"Type de document inconnu : {doc_type}")
    fields = [FormField(**f) for f in form_raw["fields"]]
    return FormDefinition(doc_type=doc_type, title=form_raw["title"], fields=fields)


@router.get("/forms", response_model=list[str])
def list_form_types():
    """Liste tous les types de documents supportés."""
    return list(FORMS.keys())
