# app/charte/structure.py

STRUCTURE = {
    "memoire": {
        "pre": [
            "page_garde",
            "dedicace",
            "remerciements",
            "resume",
            "abstract",
            "table_matieres",
            "liste_figures",
            "liste_tableaux",
            "liste_abreviations"
        ],
        "intro": "introduction_generale",
        "chapters": [
            "revue_litterature",
            "materiel_methodes",
            "resultats_discussion"
        ],
        "conclusion": "conclusion_generale",
        "post": [
            "references_bibliographiques",
            "annexes"
        ]
    },

    "rapport_stage": {
        "pre": [
            "page_garde",
            "dedicace",
            "remerciements",
            "resume",
            "abstract",
            "table_matieres",
            "liste_figures",
            "liste_tableaux",
            "liste_abreviations"
        ],
        "intro": "introduction_generale",
        "chapters": [
            "presentation_entreprise",
            "materiel_methodes",
            "resultats_discussion",
            "difficultes_rencontrees"
        ],
        "conclusion": "conclusion_generale",
        "post": [
            "references_bibliographiques",
            "annexes"
        ]
    },

    "rapport_projet": {
        "pre": [
            "page_garde",
            "dedicace",
            "remerciements",
            "resume",
            "abstract",
            "table_matieres",
            "liste_figures",
            "liste_tableaux",
            "liste_abreviations"
        ],
        "intro": "introduction_generale",
        "chapters": [
            "revue_litterature",
            "analyse_besoins",
            "materiel_methodes",
            "conception",
            "realisation",
            "tests_resultats"
        ],
        "conclusion": "conclusion_generale",
        "post": [
            "references_bibliographiques",
            "annexes"
        ]
    },

    "expose": {
        "pre": [
            "page_garde",
            "sommaire"
        ],
        "intro": "introduction",
        "chapters": [],
        "conclusion": "conclusion",
        "post": [
            "references_bibliographiques"
        ]
    },

    "demande": {
        "pre": [],
        "intro": None,
        "chapters": [],
        "conclusion": None,
        "body": [
            "entete_institution",
            "identite_etudiant",
            "matricule",
            "filiere",
            "niveau",
            "contact",
            "date_lieu",
            "destinataire",
            "objet",
            "formule_appel",
            "corps",
            "formule_politesse",
            "signature",
            "nom_complet"
        ],
        "post": []
    }
}