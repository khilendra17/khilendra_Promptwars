"""FastAPI main application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="SCOTOMA API",
    description="Neuro-Symbolic Decision Blind-Spot Analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
