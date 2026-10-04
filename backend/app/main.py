"""FastAPI application entry point for SCOTOMA backend."""

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import limiter, router
from app.config import settings
from app.db import init_db


@asynccontextmanager
async def lifespan(app_instance: FastAPI) -> AsyncGenerator[None, None]:
    """App startup and shutdown lifecycle handler."""
    init_db()
    yield


app = FastAPI(
    title="SCOTOMA API",
    description="Neuro-Symbolic Decision Blind-Spot Analysis API",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/healthz")
def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


# Serve static built React frontend if directory exists
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if not os.path.exists(static_dir):
    static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
