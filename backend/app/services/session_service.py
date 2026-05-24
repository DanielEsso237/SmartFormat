"""
Gestionnaire de session en mémoire.
Chaque upload crée une session {session_id} qui stocke :
- le chemin du fichier original
- l'analyse IA
- les données du formulaire (si renseigné)
"""
import uuid
from typing import Any, Optional
from pathlib import Path

# session_id → dict
_sessions: dict[str, dict[str, Any]] = {}


def create_session(file_path: Path, filename: str) -> str:
    sid = uuid.uuid4().hex
    _sessions[sid] = {
        "file_path": file_path,
        "filename": filename,
        "analysis": None,
        "form_data": None,
    }
    return sid


def get_session(sid: str) -> Optional[dict[str, Any]]:
    return _sessions.get(sid)


def update_session(sid: str, **kwargs) -> None:
    if sid in _sessions:
        _sessions[sid].update(kwargs)


def delete_session(sid: str) -> None:
    _sessions.pop(sid, None)
