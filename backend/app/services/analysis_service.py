"""
Service d'analyse IA du document uploadé.
Étapes :
1. Extraction du texte (PDF ou DOCX)
2. Analyse via Groq (type, cover, sections)
3. Retour d'une DocumentAnalysis structurée
"""
import json
import re
from pathlib import Path
from typing import Any

import pdfplumber
from docx import Document as DocxDocument
from groq import Groq

from app.schemas.document import DocumentAnalysis, CoverInfo


_client = None
MODEL = "llama-3.3-70b-versatile"


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq()  # lira GROQ_API_KEY depuis l'env
    return _client


# ── Text extraction ───────────────────────────────────────────────────────────

def extract_text_pdf(path: Path) -> str:
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"
    return text


def extract_text_docx(path: Path) -> str:
    doc = DocxDocument(path)
    lines = []
    for para in doc.paragraphs:
        style = para.style.name if para.style else ""
        text  = para.text.strip()
        if not text:
            continue
        if style.startswith("Heading"):
            level = style.split()[-1] if style.split()[-1].isdigit() else "1"
            lines.append(f"[H{level}] {text}")
        else:
            lines.append(text)
    return "\n".join(lines)


def extract_text(path: Path, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return extract_text_pdf(path)
    return extract_text_docx(path)


# ── IA analysis ───────────────────────────────────────────────────────────────

ANALYSIS_PROMPT = """Tu es un expert en documents académiques camerounais (Faculté des Sciences, Université d'Ébolowa).

Analyse le document ci-dessous et retourne UNIQUEMENT un JSON valide (pas de markdown, pas de texte autour).

Document :
{text}

Réponds avec ce JSON exact :
{{
  "document_type": "memoire|rapport_stage|rapport_projet|expose|demande",
  "title": "titre principal du document",
  "cover_info": {{
    "has_cover": true/false,
    "cover_complete": true/false,
    "cover_partial": true/false,
    "missing_fields": ["liste des champs manquants"],
    "extracted_data": {{
      "etudiant": "",
      "matricule": "",
      "departement": "",
      "filiere": "",
      "niveau": "",
      "theme": "",
      "encadreur": "",
      "annee_academique": "",
      "entreprise": "",
      "periode": "",
      "diplome": "",
      "membres": []
    }}
  }},
  "sections": [
    {{"level": 1, "title": "Introduction", "content": "résumé court du contenu..."}},
    {{"level": 2, "title": "Sous-section", "content": "..."}}
  ],
  "needs_form": true/false
}}

Règles :
- cover_complete = true si une vraie page de garde bien mise en forme existe
- cover_partial = true si les infos sont listées sans mise en forme de page de garde
- has_cover = true si cover_complete OU cover_partial est vrai
- needs_form = true si des informations obligatoires sont manquantes
- extraire le maximum d'infos depuis le document dans extracted_data
- sections : liste les titres et sous-titres principaux (max 20)
"""


def _safe_json(raw: str) -> dict:
    """Essaie de parser le JSON même si Groq met des ```json ... ```"""
    raw = raw.strip()
    # retire les blocs markdown
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # dernière tentative : trouver le premier { ... }
        m = re.search(r"\{.*\}", raw, re.DOTALL)
        if m:
            return json.loads(m.group())
        raise


async def analyze_document(path: Path, filename: str) -> DocumentAnalysis:
    text = extract_text(path, filename)
    # on limite pour ne pas exploser le context window
    snippet = text[:10000]

    prompt = ANALYSIS_PROMPT.format(text=snippet)

    response = _get_client().chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content or "{}"

    try:
        data: dict[str, Any] = _safe_json(raw)
    except Exception:
        # fallback minimal
        data = {
            "document_type": "memoire",
            "title": filename,
            "cover_info": {
                "has_cover": False,
                "cover_complete": False,
                "cover_partial": False,
                "missing_fields": [],
                "extracted_data": {},
            },
            "sections": [],
            "needs_form": True,
        }

    # Normalise cover_info
    ci_raw = data.get("cover_info", {})
    cover_info = CoverInfo(
        has_cover=ci_raw.get("has_cover", False),
        cover_complete=ci_raw.get("cover_complete", False),
        cover_partial=ci_raw.get("cover_partial", False),
        missing_fields=ci_raw.get("missing_fields", []),
        extracted_data=ci_raw.get("extracted_data", {}),
    )

    return DocumentAnalysis(
        document_type=data.get("document_type", "memoire"),
        title=data.get("title", filename),
        cover_info=cover_info,
        sections=data.get("sections", []),
        needs_form=data.get("needs_form", True),
    )