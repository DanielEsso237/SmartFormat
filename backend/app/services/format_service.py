import re
from pathlib import Path
from typing import Any

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from app.charte.forms import get_filiere_color
from app.schemas.document import DocumentAnalysis

FONT_NAME    = "Times New Roman"
FONT_BODY    = 12
FONT_H1      = 14
FONT_H2      = 13
FONT_H3      = 12
LINE_SPACING = 1.5
MARGIN_CM    = 2.5

PRELIM_KEYS = {
    "dedicace":      ["dedicace", "dédicace"],
    "remerciements": ["remerciements", "remerciement"],
    "resume":        ["résumé", "resume"],
    "abstract":      ["abstract"],
    "introduction":  ["introduction générale", "introduction"],
    "conclusion":    ["conclusion générale", "conclusion"],
    "bibliographie": ["références bibliographiques", "bibliographie", "bibliography", "references", "bibliographie"],
    "annexes":       ["annexes", "annexe"],
}


def _set_margins(section, cm=MARGIN_CM):
    section.top_margin    = Cm(cm)
    section.bottom_margin = Cm(cm)
    section.left_margin   = Cm(cm)
    section.right_margin  = Cm(cm)


def _font(run, size=FONT_BODY, bold=False, color=None, italic=False):
    run.font.name   = FONT_NAME
    run.font.size   = Pt(size)
    run.font.bold   = bold
    run.font.italic = italic
    if color:
        run.font.color.rgb = RGBColor(*color)


def _para(doc, text, size=FONT_BODY, bold=False, align="left",
          space_before=0, space_after=0, color=None, italic=False):
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


def _heading(doc, text, level=1):
    if level == 1:
        _para(doc, text.upper(), size=FONT_H1, bold=True,
              align="center", space_before=12, space_after=6)
    elif level == 2:
        _para(doc, text, size=FONT_H2, bold=True,
              align="left", space_before=10, space_after=4)
    else:
        _para(doc, text, size=FONT_H3, bold=True,
              align="left", space_before=8, space_after=4)


def _page_break(doc):
    doc.add_page_break()


def _write_lines(doc, lines):
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if re.match(r"^[-•–]\s+", line):
            text = re.sub(r"^[-•–]\s+", "", line)
            p = doc.add_paragraph(style="List Bullet")
            p.paragraph_format.line_spacing = LINE_SPACING
            run = p.add_run(text)
            _font(run, size=FONT_BODY)
        else:
            _para(doc, line, size=FONT_BODY, align="justify", space_after=4)


def _parse_text(original_text):
    sections = {}
    current = "__preamble__"
    sections[current] = []
    for line in original_text.split("\n"):
        s = line.strip()
        if not s:
            continue
        m = re.match(r"^\[H(\d)\]\s*(.*)", s)
        if m:
            current = m.group(2).strip()
            if current not in sections:
                sections[current] = []
        else:
            sections.setdefault(current, []).append(s)
    return sections


def _find(parsed, keys):
    for title, lines in parsed.items():
        tl = title.lower().strip()
        for key in keys:
            if key in tl or tl in key:
                content = [l for l in lines if l.strip() and not re.match(r"^\d+$", l.strip())]
                if content:
                    return content
    return []


def _body_sections(parsed):
    skip = set()
    for keys in PRELIM_KEYS.values():
        skip.update(keys)
    result = []
    for title, lines in parsed.items():
        if title == "__preamble__":
            continue
        tl = title.lower().strip()
        if any(key in tl or tl in key for key in skip):
            continue
        content = [l for l in lines if l.strip() and not re.match(r"^\d+$", l.strip())]
        result.append((title, content))
    return result


def _heading_level(title, ai_sections):
    tl = title.lower().strip()
    for s in ai_sections:
        if s.get("title", "").lower().strip() in tl or tl in s.get("title", "").lower():
            return min(int(s.get("level", 1)), 3)
    if title == title.upper() and len(title) > 3:
        return 1
    if re.match(r"^(I|II|III|IV|V|VI|VII|VIII|IX|X)[\.\-\s]", title):
        return 1
    if re.match(r"^\d+[\.\s]", title):
        return 2
    return 2


def _cover_memoire(doc, data):
    color = get_filiere_color(data.get("filiere", "TIC"))
    _para(doc, "UNIVERSITÉ D'ÉBOLOWA", size=13, bold=True, align="center")
    _para(doc, "Faculté des Sciences (FS)", size=12, bold=True, align="center")
    _para(doc, data.get("departement", "Département d'Informatique"), size=11, bold=True, align="center")
    if data.get("laboratoire"):
        _para(doc, data["laboratoire"], size=10, align="center")
    doc.add_paragraph()
    _para(doc, "MÉMOIRE", size=16, bold=True, align="center", color=color)
    _para(doc, "présenté en vue de l'obtention du", size=11, align="center", italic=True)
    d = data.get("diplome", "")
    if data.get("option"):     d += f" – Option : {data['option']}"
    if data.get("specialite"): d += f" – Spécialité : {data['specialite']}"
    _para(doc, d, size=12, bold=True, align="center")
    doc.add_paragraph()
    _para(doc, "Thème :", size=11, bold=True, align="center")
    _para(doc, data.get("theme", ""), size=13, bold=True, align="center", color=color, space_after=12)
    doc.add_paragraph()
    _para(doc, "Présenté par :", size=11, bold=True, align="left")
    _para(doc, data.get("etudiant", ""), size=12, align="left")
    if data.get("matricule"):      _para(doc, f"Matricule : {data['matricule']}", size=11, align="left")
    if data.get("diplome_entree"): _para(doc, f"Diplôme d'entrée : {data['diplome_entree']}", size=11, align="left")
    doc.add_paragraph()
    _para(doc, "Sous la direction de :", size=11, bold=True, align="left")
    enc = data.get("encadreur", "")
    if data.get("grade_encadreur"): enc += f", {data['grade_encadreur']}"
    _para(doc, enc, size=11, align="left")
    if data.get("universite_attache"): _para(doc, data["universite_attache"], size=11, align="left")
    doc.add_paragraph()
    _para(doc, f"Année académique : {data.get('annee_academique', '20XX-20XX')}", size=11, bold=True, align="center")


def _cover_stage(doc, data):
    _para(doc, "UNIVERSITÉ D'ÉBOLOWA", size=13, bold=True, align="center")
    _para(doc, "Faculté des Sciences", size=12, bold=True, align="center")
    if data.get("departement"): _para(doc, data["departement"], size=11, bold=True, align="center")
    doc.add_paragraph()
    _para(doc, "RAPPORT DE STAGE", size=16, bold=True, align="center")
    _para(doc, f"Entreprise : {data.get('entreprise', '')}", size=12, bold=True, align="center")
    _para(doc, f"Période : {data.get('periode', '')}", size=11, align="center")
    doc.add_paragraph()
    _para(doc, "Présenté par :", size=11, bold=True, align="left")
    _para(doc, data.get("etudiant", ""), size=12, align="left")
    if data.get("matricule"): _para(doc, f"Matricule : {data['matricule']}", size=11, align="left")
    doc.add_paragraph()
    if data.get("encadreur_academique"):    _para(doc, f"Encadreur académique : {data['encadreur_academique']}", size=11, align="left")
    if data.get("encadreur_professionnel"): _para(doc, f"Encadreur professionnel : {data['encadreur_professionnel']}", size=11, align="left")
    doc.add_paragraph()
    _para(doc, f"Année académique : {data.get('annee_academique', '')}", size=11, bold=True, align="center")


def _cover_projet(doc, data):
    _para(doc, "UNIVERSITÉ D'ÉBOLOWA", size=13, bold=True, align="center")
    _para(doc, "Faculté des Sciences", size=12, bold=True, align="center")
    if data.get("departement"): _para(doc, data["departement"], size=11, bold=True, align="center")
    doc.add_paragraph()
    _para(doc, "RAPPORT DE PROJET", size=16, bold=True, align="center")
    _para(doc, "Thème :", size=11, bold=True, align="center")
    _para(doc, data.get("theme", ""), size=13, bold=True, align="center", space_after=12)
    doc.add_paragraph()
    _para(doc, "Présenté par :", size=11, bold=True, align="left")
    _para(doc, data.get("etudiant", ""), size=12, align="left")
    if data.get("matricule"): _para(doc, f"Matricule : {data['matricule']}", size=11, align="left")
    doc.add_paragraph()
    if data.get("encadreur_academique"):    _para(doc, f"Encadreur académique : {data['encadreur_academique']}", size=11, align="left")
    if data.get("encadreur_professionnel"): _para(doc, f"Encadreur professionnel : {data['encadreur_professionnel']}", size=11, align="left")
    _para(doc, f"Année académique : {data.get('annee_academique', '')}", size=11, bold=True, align="center")


def _cover_expose(doc, data):
    _para(doc, "UNIVERSITÉ D'ÉBOLOWA", size=13, bold=True, align="center")
    _para(doc, "Faculté des Sciences", size=12, bold=True, align="center")
    if data.get("ue"): _para(doc, f"UE : {data['ue']}", size=11, align="center")
    doc.add_paragraph()
    _para(doc, "EXPOSÉ", size=16, bold=True, align="center")
    _para(doc, "Thème :", size=11, bold=True, align="center")
    _para(doc, data.get("theme", ""), size=13, bold=True, align="center", space_after=12)
    doc.add_paragraph()
    if data.get("membres"):
        _para(doc, f"Groupe {data.get('groupe', '')}", size=11, bold=True, align="left")
        for m in (data["membres"] if isinstance(data["membres"], list) else []):
            if isinstance(m, dict):
                line = m.get("nom", "")
                if m.get("matricule"): line += f"  –  {m['matricule']}"
                _para(doc, line, size=11, align="left")
    doc.add_paragraph()
    if data.get("enseignant"): _para(doc, f"Enseignant : {data['enseignant']}", size=11, align="left")
    if data.get("niveau"):     _para(doc, f"Niveau : {data['niveau']}  |  Filière : {data.get('filiere', '')}", size=11, align="left")
    _para(doc, f"Année académique : {data.get('annee_academique', '')}", size=11, bold=True, align="center")


def _cover_demande(doc, data):
    _para(doc, data.get("etudiant", ""), size=12, bold=True, align="left")
    if data.get("matricule"): _para(doc, f"Matricule : {data['matricule']}", size=11, align="left")
    if data.get("filiere"):   _para(doc, f"Filière : {data['filiere']}  –  Niveau : {data.get('niveau', '')}", size=11, align="left")
    if data.get("email"):     _para(doc, f"Email : {data['email']}", size=11, align="left")
    if data.get("tel"):       _para(doc, f"Tél : {data['tel']}", size=11, align="left")
    doc.add_paragraph()
    _para(doc, data.get("date_lieu", ""), size=11, align="right")
    doc.add_paragraph()
    _para(doc, f"À : {data.get('destinataire', '')}", size=12, bold=True, align="right")
    doc.add_paragraph()
    _para(doc, f"Objet : {data.get('objet', '')}", size=12, bold=True, align="left")
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
            if line.strip(): _para(doc, f"– {line.strip()}", size=11, align="left")
    doc.add_paragraph()
    _para(doc, data.get("signature", data.get("etudiant", "")), size=12, align="right")


COVER_BUILDERS = {
    "memoire":        _cover_memoire,
    "rapport_stage":  _cover_stage,
    "rapport_projet": _cover_projet,
    "expose":         _cover_expose,
    "demande":        _cover_demande,
}


def format_document(
    analysis: DocumentAnalysis,
    form_data: dict[str, Any],
    original_text: str,
    output_path: Path,
) -> Path:
    doc     = Document()
    sec     = doc.sections[0]
    _set_margins(sec)

    style = doc.styles["Normal"]
    style.font.name = FONT_NAME
    style.font.size = Pt(FONT_BODY)
    style.paragraph_format.line_spacing = LINE_SPACING

    doc_type = analysis.document_type
    parsed   = _parse_text(original_text) if original_text else {}

    if doc_type == "demande":
        _cover_demande(doc, form_data)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        doc.save(output_path)
        return output_path

    COVER_BUILDERS.get(doc_type, _cover_memoire)(doc, form_data)
    _page_break(doc)

    if doc_type in ("memoire", "rapport_stage", "rapport_projet"):
        for label, keys in [
            ("DÉDICACE",       PRELIM_KEYS["dedicace"]),
            ("REMERCIEMENTS",  PRELIM_KEYS["remerciements"]),
            ("RÉSUMÉ",         PRELIM_KEYS["resume"]),
            ("ABSTRACT",       PRELIM_KEYS["abstract"]),
        ]:
            _heading(doc, label, level=1)
            content = _find(parsed, keys)
            if content:
                _write_lines(doc, content)
            else:
                _para(doc, f"[À compléter : {label.lower()}]", size=FONT_BODY, italic=True, align="justify")
            _page_break(doc)

        _heading(doc, "TABLE DES MATIÈRES", level=1)
        _para(doc, "[La table des matières sera générée automatiquement par Word : Références → Table des matières]",
              size=FONT_BODY, italic=True, align="left")
        _page_break(doc)

    elif doc_type == "expose":
        _heading(doc, "SOMMAIRE", level=1)
        sommaire = _find(parsed, ["sommaire"])
        if sommaire:
            _write_lines(doc, sommaire)
        _page_break(doc)

    intro_label = "INTRODUCTION GÉNÉRALE" if doc_type != "expose" else "INTRODUCTION"
    _heading(doc, intro_label, level=1)
    intro = _find(parsed, PRELIM_KEYS["introduction"])
    if intro:
        _write_lines(doc, intro)
    else:
        _para(doc, "[À rédiger]", size=FONT_BODY, italic=True)
    doc.add_paragraph()

    for title, lines in _body_sections(parsed):
        level = _heading_level(title, analysis.sections)
        _heading(doc, title, level=level)
        if lines:
            _write_lines(doc, lines)

    _page_break(doc)
    conc_label = "CONCLUSION GÉNÉRALE" if doc_type != "expose" else "CONCLUSION"
    _heading(doc, conc_label, level=1)
    conc = _find(parsed, PRELIM_KEYS["conclusion"])
    if conc:
        _write_lines(doc, conc)
    else:
        _para(doc, "[À rédiger]", size=FONT_BODY, italic=True)

    _page_break(doc)
    _heading(doc, "RÉFÉRENCES BIBLIOGRAPHIQUES", level=1)
    biblio = _find(parsed, PRELIM_KEYS["bibliographie"])
    if biblio:
        _write_lines(doc, biblio)
    else:
        _para(doc, "[À compléter selon le style Elsevier / Vancouver]", size=FONT_BODY, italic=True)

    if doc_type in ("memoire", "rapport_stage", "rapport_projet"):
        _page_break(doc)
        _heading(doc, "ANNEXES", level=1)
        annexes = _find(parsed, PRELIM_KEYS["annexes"])
        if annexes:
            _write_lines(doc, annexes)
        else:
            _para(doc, "[Insérer les annexes ici]", size=FONT_BODY, italic=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(output_path)
    return output_path