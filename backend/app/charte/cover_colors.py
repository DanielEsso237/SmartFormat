"""
app/chartes/cover_colors.py
Couleurs de couverture par filière selon la charte officielle FS-UEb (Article 8).
"""

from docx.shared import RGBColor

# Couleurs par filière (code filière → RGBColor)
FILIERE_COLORS = {
    "BP":   RGBColor(0x00, 0x70, 0xC0),   # Bleu   — Biotechnologies et Productions Végétales
    "SBM":  RGBColor(0x00, 0xB0, 0x50),   # Vert   — Sciences Biomédicales
    "TIC":  RGBColor(0xFF, 0xFF, 0xFF),   # Blanc  — Technologies de l'Information et de la Communication
    "SBAA": RGBColor(0x7F, 0x3F, 0x00),   # Marron — Sciences Biologiques, Alimentaires et Agronomiques
    "ROSE": RGBColor(0xC0, 0x00, 0x00),   # Rouge  — ROSE
    "CA":   RGBColor(0xFF, 0x7F, 0x00),   # Orange — Chimie Appliquée
    "GE":   RGBColor(0x80, 0x80, 0x80),   # Gris   — Géosciences
    "ER":   RGBColor(0xF5, 0xDC, 0xAA),   # Beige  — Énergies Renouvelables
    "PA":   RGBColor(0x7B, 0x2F, 0xBE),   # Violet — Physique Appliquée
}

DEFAULT_COLOR = RGBColor(0x00, 0x70, 0xC0)  # Bleu par défaut


def get_filiere_color(filiere: str) -> RGBColor:
    """Retourne la couleur RGB de la filière. Insensible à la casse."""
    if not filiere:
        return DEFAULT_COLOR
    return FILIERE_COLORS.get(filiere.upper().strip(), DEFAULT_COLOR)