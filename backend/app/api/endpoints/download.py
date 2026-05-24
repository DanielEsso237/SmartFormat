from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter()
UPLOAD_DIR = Path("uploads")


@router.get("/download/{filename}")
def download_file(filename: str):
    if ".." in filename or "/" in filename:
        raise HTTPException(400, "Nom de fichier invalide")

    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(404, "Fichier introuvable")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
