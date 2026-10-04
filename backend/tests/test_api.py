"""Tests for FastAPI endpoints and input validation."""

from unittest.mock import patch

import pytest
from app.db import init_db
from app.main import app
from app.models.schemas import Claim, ClaimGraph
from fastapi.testclient import TestClient

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database() -> None:
    """Ensure database tables exist before running tests."""
    init_db()


def test_health_check() -> None:
    """Verify healthz status endpoint."""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_session_validation_error() -> None:
    """Verify input validation rules for session creation."""
    payload = {
        "decision_title": "Too short",
        "options": ["Opt 1", "Opt 2"],
        "reasoning": "Short text",
    }
    response = client.post("/api/sessions", json=payload)
    assert response.status_code == 422


@patch("app.services.extractor.extract_claims")
def test_session_analyze_workflow(mock_extract) -> None:
    """Verify full session creation and analysis pipeline execution."""
    reasoning_text = (
        "I am deciding whether to take the high paying internship near my home "
        "or look for remote software engineer roles with better growth."
    )
    mock_extract.return_value = ClaimGraph(
        claims=[
            Claim(
                id="c1",
                text="High paying internship near home",
                quote="high paying internship near my home",
                kind="assumption",
                lens="money",
                option="Internship",
                polarity=1,
                weight=5,
            )
        ],
        relations=[],
    )

    create_res = client.post(
        "/api/sessions",
        json={
            "decision_title": "Internship vs Remote Role",
            "options": ["Internship", "Remote Role"],
            "reasoning": reasoning_text,
        },
    )
    assert create_res.status_code == 201
    session_id = create_res.json()["id"]

    analyze_res = client.post(f"/api/sessions/{session_id}/analyze")
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert data["session_id"] == session_id
    assert data["version"] == 1
    assert "blind_spots" in data
    assert "attention_gap" in data
