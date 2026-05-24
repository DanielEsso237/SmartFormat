
FORMS: dict = {

    # ──────────────────────────────────────────────────────────────
    # EXPOSÉ
    # ──────────────────────────────────────────────────────────────
    "expose": {
        "title": "Exposé académique",
        "fields": [
            {"name": "ue",        "label": "UE",              "type": "text",   "required": False, "placeholder": "Ex: TIC345 Cloud Computing"},
            {"name": "theme",     "label": "Thème",           "type": "text",   "required": True,  "placeholder": "Ex: Les architectures serverless"},
            {"name": "niveau",    "label": "Niveau",          "type": "select", "required": False,
             "options": ["Licence 1","Licence 2","Licence 3","Master 1","Master 2"]},
            {"name": "filiere",   "label": "Filière",         "type": "text",   "required": False, "placeholder": "Ex: TIC"},
            {"name": "groupe",    "label": "Numéro du groupe","type": "text",   "required": False, "placeholder": "Ex: 4"},
            {"name": "membres",   "label": "Membres du groupe","type": "members_list","required": True,
             "fields": [
                 {"name": "nom",       "label": "Nom et prénom","type": "text"},
                 {"name": "matricule", "label": "Matricule",   "type": "text"},
                 {"name": "filiere",   "label": "Filière",     "type": "text"},
             ]},
            {"name": "enseignant",        "label": "Enseignant",       "type": "text","required": False,"placeholder": "Ex: Dr. KENGNI"},
            {"name": "annee_academique",  "label": "Année académique", "type": "text","required": True, "placeholder": "Ex: 2025-2026"},
        ]
    },

    # ──────────────────────────────────────────────────────────────
    # MÉMOIRE
    # ──────────────────────────────────────────────────────────────
    "memoire": {
        "title": "Mémoire",
        "fields": [
            {"name": "departement",       "label": "Département",              "type": "text", "required": True,  "placeholder": "Ex: Département d'Informatique"},
            {"name": "departement_en",    "label": "Department (anglais)",     "type": "text", "required": False, "placeholder": "Ex: Department of Computer Science"},
            {"name": "laboratoire",       "label": "Laboratoire",              "type": "text", "required": False, "placeholder": "Ex: LICIA"},
            {"name": "laboratoire_en",    "label": "Laboratory (anglais)",     "type": "text", "required": False, "placeholder": "Ex: Computer Science Laboratory"},
            {"name": "theme",             "label": "Thème du mémoire",         "type": "text", "required": True,  "placeholder": "Ex: Conception d'une plateforme..."},
            {"name": "diplome",           "label": "Diplôme",                  "type": "text", "required": True,  "placeholder": "Ex: Master en Informatique"},
            {"name": "option",            "label": "Option",                   "type": "text", "required": False, "placeholder": "Ex: Génie Logiciel"},
            {"name": "specialite",        "label": "Spécialité",               "type": "text", "required": False, "placeholder": "Ex: Intelligence Artificielle"},
            {"name": "etudiant",          "label": "Étudiant",                 "type": "text", "required": True,  "placeholder": "Ex: MBOUMBA Jean Calvin"},
            {"name": "diplome_entree",    "label": "Diplôme d'entrée",         "type": "text", "required": False, "placeholder": "Ex: Licence en Informatique"},
            {"name": "matricule",         "label": "Matricule",                "type": "text", "required": False, "placeholder": "Ex: 22U00001"},
            {"name": "encadreur",         "label": "Encadreur",                "type": "text", "required": True,  "placeholder": "Ex: Dr. EYANGO Pierre"},
            {"name": "grade_encadreur",   "label": "Grade de l'encadreur",     "type": "text", "required": False, "placeholder": "Ex: Maître de Conférences"},
            {"name": "universite_attache","label": "Université de rattachement","type": "text", "required": False, "placeholder": "Ex: Université d'Ebolowa"},
            {"name": "annee_academique",  "label": "Année académique",         "type": "text", "required": True,  "placeholder": "Ex: 2025-2026"},
        ]
    },

    # ──────────────────────────────────────────────────────────────
    # RAPPORT DE STAGE
    # ──────────────────────────────────────────────────────────────
    "rapport_stage": {
        "title": "Rapport de stage",
        "fields": [
            {"name": "departement",              "label": "Département",           "type": "text","required": True,  "placeholder": "Ex: Département d'Informatique"},
            {"name": "entreprise",               "label": "Entreprise d'accueil",  "type": "text","required": True,  "placeholder": "Ex: CAMTEL"},
            {"name": "periode",                  "label": "Période du stage",      "type": "text","required": True,  "placeholder": "Ex: Juin - Août 2025"},
            {"name": "etudiant",                 "label": "Étudiant",              "type": "text","required": True,  "placeholder": "Ex: MBOUMBA Jean Calvin"},
            {"name": "matricule",                "label": "Matricule",             "type": "text","required": False, "placeholder": "Ex: 22U00001"},
            {"name": "encadreur_academique",     "label": "Encadreur académique",  "type": "text","required": False, "placeholder": "Ex: Dr. EYANGO Pierre"},
            {"name": "encadreur_professionnel",  "label": "Encadreur professionnel","type": "text","required": False,"placeholder": "Ex: M. NGONO"},
            {"name": "annee_academique",         "label": "Année académique",      "type": "text","required": True,  "placeholder": "Ex: 2025-2026"},
        ]
    },

    # ──────────────────────────────────────────────────────────────
    # RAPPORT PROJET
    # ──────────────────────────────────────────────────────────────
    "rapport_projet": {
        "title": "Rapport de projet",
        "fields": [
            {"name": "departement",             "label": "Département",           "type": "text","required": True,  "placeholder": "Ex: Département d'Informatique"},
            {"name": "laboratoire",             "label": "Laboratoire",           "type": "text","required": False, "placeholder": "Ex: LICIA"},
            {"name": "theme",                   "label": "Thème du projet",       "type": "text","required": True,  "placeholder": "Ex: Système intelligent de gestion..."},
            {"name": "etudiant",                "label": "Étudiant",              "type": "text","required": True,  "placeholder": "Ex: MBOUMBA Jean Calvin"},
            {"name": "matricule",               "label": "Matricule",             "type": "text","required": False, "placeholder": "Ex: 22U00001"},
            {"name": "encadreur_academique",    "label": "Encadreur académique",  "type": "text","required": False, "placeholder": "Ex: Dr. EYANGO Pierre"},
            {"name": "encadreur_professionnel", "label": "Encadreur professionnel","type": "text","required": False,"placeholder": "Ex: M. NGONO"},
            {"name": "annee_academique",        "label": "Année académique",      "type": "text","required": True,  "placeholder": "Ex: 2025-2026"},
        ]
    },

    # ──────────────────────────────────────────────────────────────
    # DEMANDE ADMINISTRATIVE
    # ──────────────────────────────────────────────────────────────
    "demande": {
        "title": "Demande administrative",
        "fields": [
            {"name": "date_lieu",         "label": "Lieu et date",          "type": "text",     "required": True,  "placeholder": "Ex: Ebolowa le 05 Mai 2026"},
            {"name": "etudiant",          "label": "Nom et prénom",         "type": "text",     "required": True,  "placeholder": "Ex: MBOUMBA Jean Calvin"},
            {"name": "matricule",         "label": "Matricule",             "type": "text",     "required": False, "placeholder": "Ex: 22U00001"},
            {"name": "filiere",           "label": "Filière",               "type": "text",     "required": False, "placeholder": "Ex: TIC"},
            {"name": "niveau",            "label": "Niveau",                "type": "text",     "required": False, "placeholder": "Ex: Licence 3"},
            {"name": "email",             "label": "Adresse email",         "type": "text",     "required": False, "placeholder": "Ex: jean@email.com"},
            {"name": "tel",              "label": "Téléphone",              "type": "text",     "required": False, "placeholder": "Ex: 699730781"},
            {"name": "destinataire",      "label": "Destinataire",          "type": "text",     "required": True,  "placeholder": "Ex: Monsieur le Doyen"},
            {"name": "objet",             "label": "Objet",                 "type": "text",     "required": True,  "placeholder": "Ex: Demande de soutenance"},
            {"name": "formule_appel",     "label": "Formule d'appel",       "type": "text",     "required": False, "placeholder": "Ex: Monsieur le Doyen,"},
            {"name": "corps",             "label": "Corps de la demande",   "type": "textarea", "required": True,  "placeholder": "Rédigez votre demande..."},
            {"name": "formule_politesse", "label": "Formule de politesse",  "type": "textarea", "required": False, "placeholder": "Dans l'attente d'une suite favorable..."},
            {"name": "pieces_jointes",    "label": "Pièces jointes",        "type": "textarea", "required": False, "placeholder": "Ex:\nPhotocopie CNI\nReçu de paiement"},
            {"name": "signature",         "label": "Signature",             "type": "text",     "required": False, "placeholder": "Ex: MBOUMBA Jean Calvin"},
        ]
    },
}

FILIERE_COLORS = {
    "BP":   (0x00, 0x70, 0xC0),
    "SBM":  (0x00, 0xB0, 0x50),
    "TIC":  (0xFF, 0xFF, 0xFF),
    "SBAA": (0x7F, 0x3F, 0x00),
    "ROSE": (0xC0, 0x00, 0x00),
    "CA":   (0xFF, 0x7F, 0x00),
    "GE":   (0x80, 0x80, 0x80),
    "ER":   (0xF5, 0xDC, 0xAA),
    "PA":   (0x7B, 0x2F, 0xBE),
}
DEFAULT_COLOR = (0x00, 0x70, 0xC0)

def get_filiere_color(filiere: str):
    if not filiere:
        return DEFAULT_COLOR
    return FILIERE_COLORS.get(filiere.upper().strip(), DEFAULT_COLOR)
