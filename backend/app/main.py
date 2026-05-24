from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import upload, forms, download, analyze

app = FastAPI(title="SmartFormat API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Path("uploads").mkdir(exist_ok=True)

app.include_router(upload.router,   prefix="/api", tags=["upload"])
app.include_router(forms.router,    prefix="/api", tags=["forms"])
app.include_router(download.router, prefix="/api", tags=["download"])
app.include_router(analyze.router,  prefix="/api", tags=["analyze"])

@app.get("/")
def root():
    return {"message": "SmartFormat API v2 running"}

@app.get("/api/health")
def health():
    return {"status": "ok"}