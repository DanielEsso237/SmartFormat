import json
import re
from pathlib import Path
from typing import Any

from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

from app.charte.forms import get_filiere_color
from app.schemas.document import DocumentAnalysis


FONT_NAME   = "Times New Roman"
FONT_BODY   = 12
FONT_H1     = 14
FONT_H2     = 13
FONT_H3     = 12
LINE_SPACING = 1.5   
MARGIN_CM   = 2.5


def _set_margins(section, cm: float = MARGIN_CM):
    section.top_margin    = Cm(cm)
    section.bottom_margin = Cm(cm)
    section.left_margin   = Cm(cm)
    section.right_margin  = Cm(cm)


def _font(run, size: int = FONT_BODY, bold: bool = False,
          color: tuple | None = None, italic: bool = False):
    run.font.name = FONT_NAME
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    if color:
        run.font.color.rgb = RGBColor(*color)


def _para(doc: Document, text: str, size: int = FONT_BODY,
          bold: bool = False, align: str = "left",
          space_before: int = 0, space_after: int = 0,
          color: tuple | None = None, italic: bool = False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after  = Pt(space_after)
    p.paragraph_format.line_spacing = LINE_SPACING
    aligns = {
        "left":    WD_ALIGN_PARAGRAPH.LEFT,
        "center":  WD_ALIGN_PARAGRAPH.CENTER,
        "right":   WD_ALIGN_PARAGRAPH.RIGHT,
        "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
    }
    p.alignment = aligns.get(align, WD_ALIGN_PARAGRAPH.LEFT)
    run = p.add_run(text)
    _font(run, size=size, bold=bold, color=color, italic=italic)
    return p


def _heading(doc: Document, text: str, level: int = 1):
    """Ajoute un titre formaté selon la charte."""
    if level == 1:
        p = _para(doc, text.upper(), size=FONT_H1, bold=True,
                  align="center", space_before=12, space_after=6)
    elif level == 2:
        p = _para(doc, text, size=FONT_H2, bold=True,
                  align="left", space_before=10, space_after=4)
    else:
        p = _para(doc, text, size=FONT_H3, bold=True,
                  align="left", space_before=8, space_after=4)
    return p


def _page_break(doc: Document):
    doc.add_page_break()


def _build_cover_memoire(doc: Document, data: dict):
    filiere = data.get("filiere", "TIC")
    color   = get_filiere_color(filiere)

    _para(doc, "UNIVERSITÉ D'ÉBOLOWA", size=13, bold=True, align="center")
    _para(doc, "Faculté des Sciences (FS)", size=12, bold=True, align="center")
    dept = data.get("departement", "Département d'Informatique")
    _para(doc, dept, size=11, bold=True, align="center")
    if data.get("laboratoire"):
        _para(doc, data["laboratoire"], size=10, align="center")
    doc.add_paragraph()

    _para(doc, "MÉMOIRE", size=16, bold=True, align="center", color=color)
    _para(doc, "présenté en vue de l'obtention du", size=11, align="center", italic=True)
    diplome = data.get("diplome", "")
    option  = data.get("option", "")
    spec    = data.get("specialite", "")
    diplome_str = diplome
    if option:  diplome_str += f" – Option : {option}"
    if spec:    diplome_str += f" – Spécialité : {spec}"
    _para(doc, diplome_str, size=12, bold=True, align="center")
    doc.add_paragraph()

    _para(doc, "Thème :", size=11, bold=True, align="center")
    theme = data.get("theme", "Titre du mémoire")
    _para(doc, theme, size=13, bold=True, align="center", color=color, space_after=12)
    doc.add_paragraph()

    _para(doc, "Présenté par :", size=11, bold=True, align="left")
    _para(doc, data.get("etudiant", ""), size=12, align="left")
    if data.get("matricule"):
        _para(doc, f"Matricule : {data['matricule']}", size=11, align="left")
    if data.get("diplome_entree"):
        _para(doc, f"Diplôme d'entrée : {data['diplome_entree']}", size=11, align="left")
    doc.add_paragraph()

    _para(doc, "Sous la direction de :", size=11, bold=True, align="left")
    encadreur = data.get("encadreur", "")
    grade     = data.get("grade_encadreur", "")
    univ      = data.get("universite_attache", "")
    enc_str   = encadreur
    if grade: enc_str += f", {grade}"
    if univ:  enc_str += f"\n{univ}"
    _para(doc, enc_str, size=11, align="left")
    doc.add_paragraph()

    annee = data.get("annee_academique", "20XX-20XX")
    _para(doc, f"Année académique : {annee}", size=11, bold=True, align="center")


def _build_cover_expose(doc: Document, data: dict):
    _para(doc, "UNIVERSITÉ D'ÉBOLOWA", size=13, bold=True, align="center")
    _para(doc, "Faculté des Sciences", size=12, bold=True, align="center")
    if data.get("ue"):
        _para(doc, f"UE : {data['ue']}", size=11, align="center")
    doc.add_paragraph()
    _para(doc, "EXPOSÉ", size=16, bold=True, align="center")
    _para(doc, "Thème :", size=11, bold=True, align="center")
    _para(doc, data.get("theme", ""), size=13, bold=True, align="center", space_after=12)
    doc.add_paragraph()
    if data.get("membres"):
        _para(doc, f"Groupe {data.get('groupe','')}", size=11, bold=True, align="left")
        members = data["membres"]
        if isinstance(members, list):
            for m in members:
                if isinstance(m, dict):
                    line = m.get("nom", "")
                    if m.get("matricule"): line += f"  –  {m['matricule']}"
                    _para(doc, line, size=11, align="left")
    doc.add_paragraph()
    if data.get("enseignant"):
        _para(doc, f"Enseignant : {data['enseignant']}", size=11, align="left")
    if data.get("niveau"):
        _para(doc, f"Niveau : {data['niveau']}  |  Filière : {data.get('filiere','')}", size=11, align="left")
    _para(doc, f"Année académique : {data.get('annee_academique','')}", size=11, bold=True, align="center")


def _build_cover_stage(doc: Document, data: dict):
    _para(doc, "UNIVERSITÉ D'ÉBOLOWA", size=13, bold=True, align="center")
    _para(doc, "Faculté des Sciences", size=12, bold=True, align="center")
    if data.get("departement"):
        _para(doc, data["departement"], size=11, bold=True, align="center")
    doc.add_paragraph()
    _para(doc, "RAPPORT DE STAGE", size=16, bold=True, align="center")
    _para(doc, f"Entreprise : {data.get('entreprise','')}", size=12, bold=True, align="center")
    _para(doc, f"Période : {data.get('periode','')}", size=11, align="center")
    doc.add_paragraph()
    _para(doc, "Présenté par :", size=11, bold=True, align="left")
    _para(doc, data.get("etudiant", ""), size=12, align="left")
    if data.get("matricule"):
        _para(doc, f"Matricule : {data['matricule']}", size=11, align="left")
    doc.add_paragraph()
    if data.get("encadreur_academique"):
        _para(doc, f"Encadreur académique : {data['encadreur_academique']}", size=11, align="left")
    if data.get("encadreur_professionnel"):
        _para(doc, f"Encadreur professionnel : {data['encadreur_professionnel']}", size=11, align="left")
    _para(doc, f"Année académique : {data.get('annee_academique','')}", size=11, bold=True, align="center")


def _build_cover_projet(doc: Document, data: dict):
    _para(doc, "UNIVERSITÉ D'ÉBOLOWA", size=13, bold=True, align="center")
    _para(doc, "Faculté des Sciences", size=12, bold=True, align="center")
    if data.get("departement"):
        _para(doc, data["departement"], size=11, bold=True, align="center")
    doc.add_paragraph()
    _para(doc, "RAPPORT DE PROJET", size=16, bold=True, align="center")
    _para(doc, "Thème :", size=11, bold=True, align="center")
    _para(doc, data.get("theme", ""), size=13, bold=True, align="center", space_after=12)
    doc.add_paragraph()
    _para(doc, "Présenté par :", size=11, bold=True, align="left")
    _para(doc, data.get("etudiant", ""), size=12, align="left")
    if data.get("matricule"):
        _para(doc, f"Matricule : {data['matricule']}", size=11, align="left")
    doc.add_paragraph()
    if data.get("encadreur_academique"):
        _para(doc, f"Encadreur académique : {data['encadreur_academique']}", size=11, align="left")
    if data.get("encadreur_professionnel"):
        _para(doc, f"Encadreur professionnel : {data['encadreur_professionnel']}", size=11, align="left")
    _para(doc, f"Année académique : {data.get('annee_academique','')}", size=11, bold=True, align="center")


def _build_cover_demande(doc: Document, data: dict):
    _para(doc, data.get("etudiant", ""), size=12, bold=True, align="left")
    if data.get("matricule"):
        _para(doc, f"Matricule : {data['matricule']}", size=11, align="left")
    if data.get("filiere"):
        _para(doc, f"Filière : {data['filiere']}  –  Niveau : {data.get('niveau','')}", size=11, align="left")
    if data.get("email"):
        _para(doc, f"Email : {data['email']}", size=11, align="left")
    if data.get("tel"):
        _para(doc, f"Tél : {data['tel']}", size=11, align="left")
    doc.add_paragraph()
    _para(doc, data.get("date_lieu", ""), size=11, align="right")
    doc.add_paragraph()
    _para(doc, f"À : {data.get('destinataire','')}", size=12, bold=True, align="right")
    doc.add_paragraph()
    _para(doc, f"Objet : {data.get('objet','')}", size=12, bold=True, align="left")
    doc.add_paragraph()
    if data.get("formule_appel"):
        _para(doc, data["formule_appel"], size=12, align="left")
        doc.add_paragraph()
    if data.get("corps"):
        for line in data["corps"].split("\n"):
            _para(doc, line, size=12, align="justify")
    doc.add_paragraph()
    if data.get("formule_politesse"):
        for line in data["formule_politesse"].split("\n"):
            _para(doc, line, size=12, align="justify")
    doc.add_paragraph()
    if data.get("pieces_jointes"):
        _para(doc, "Pièces jointes :", size=11, bold=True, align="left")
        for line in data["pieces_jointes"].split("\n"):
            if line.strip():
                _para(doc, f"– {line.strip()}", size=11, align="left")
    doc.add_paragraph()
    _para(doc, data.get("signature", data.get("etudiant", "")), size=12, align="right")


COVER_BUILDERS = {
    "memoire":        _build_cover_memoire,
    "rapport_stage":  _build_cover_stage,
    "rapport_projet": _build_cover_projet,
    "expose":         _build_cover_expose,
    "demande":        _build_cover_demande,
}



def _build_body(doc: Document, sections: list[dict], original_text: str = ""):
    """Reconstruit le corps du document depuis les sections analysées."""
    if sections:
        for section in sections:
            level   = int(section.get("level", 1))
            title   = section.get("title", "")
            content = section.get("content", "")
            if title:
                _heading(doc, title, level=min(level, 3))
            if content:
                for line in content.split("\n"):
                    line = line.strip()
                    if line:
                        _para(doc, line, size=FONT_BODY, align="justify",
                              space_before=0, space_after=6)
    elif original_text:
        for line in original_text.split("\n"):
            line = line.strip()
            if not line:
                continue
            m = re.match(r"^\[H(\d)\]\s*(.*)", line)
            if m:
                _heading(doc, m.group(2), level=int(m.group(1)))
            else:
                _para(doc, line, size=FONT_BODY, align="justify",
                      space_before=0, space_after=6)

def format_document(
    analysis: DocumentAnalysis,
    form_data: dict[str, Any],
    original_text: str,
    output_path: Path,
) -> Path:

    doc = Document()
    section = doc.sections[0]
    _set_margins(section)

    style = doc.styles["Normal"]
    style.font.name = FONT_NAME
    style.font.size = Pt(FONT_BODY)
    style.paragraph_format.line_spacing = LINE_SPACING

    doc_type = analysis.document_type

    if doc_type != "demande":
        builder = COVER_BUILDERS.get(doc_type, _build_cover_memoire)
        builder(doc, form_data)
        _page_break(doc)

        prelim_sections = ["DÉDICACE", "REMERCIEMENTS", "RÉSUMÉ", "ABSTRACT"]
        if doc_type in ("memoire", "rapport_stage", "rapport_projet"):
            for sec in prelim_sections:
                _heading(doc, sec, level=1)
                _para(doc, f"[À compléter : {sec.lower()}]",
                      size=FONT_BODY, italic=True, align="justify")
                _page_break(doc)

            _heading(doc, "TABLE DES MATIÈRES", level=1)
            _para(doc, "[La table des matières sera générée automatiquement par Word (Références → Table des matières)]",
                  size=FONT_BODY, italic=True, align="left")
            _page_break(doc)

        _heading(doc, "INTRODUCTION GÉNÉRALE" if doc_type != "expose" else "INTRODUCTION", level=1)
        _para(doc, "[À rédiger]", size=FONT_BODY, italic=True)
        doc.add_paragraph()

    else:
        builder = COVER_BUILDERS["demande"]
        builder(doc, form_data)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        doc.save(output_path)
        return output_path

    body_sections = [
        s for s in analysis.sections
        if s.get("title","").lower() not in {
            "introduction", "conclusion", "dédicace", "remerciements",
            "résumé", "abstract", "table des matières",
        }
    ]
    if body_sections:
        _build_body(doc, body_sections, original_text)
    else:
        _build_body(doc, [], original_text)

    _page_break(doc)
    _heading(doc, "CONCLUSION GÉNÉRALE" if doc_type != "expose" else "CONCLUSION", level=1)
    _para(doc, "[À rédiger]", size=FONT_BODY, italic=True)

    _page_break(doc)
    _heading(doc, "RÉFÉRENCES BIBLIOGRAPHIQUES", level=1)
    _para(doc, "[À compléter selon le style Elsevier / Vancouver]",
          size=FONT_BODY, italic=True)

    if doc_type in ("memoire", "rapport_stage", "rapport_projet"):
        _page_break(doc)
        _heading(doc, "ANNEXES", level=1)
        _para(doc, "[Insérer les annexes ici]", size=FONT_BODY, italic=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(output_path)
    return output_path
