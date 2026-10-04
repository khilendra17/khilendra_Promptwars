"""Tests for FastAPI endpoints, input validation, and edge cases."""

import uuid
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


def test_nonexistent_session_returns_404() -> None:
    """Verify 404 error when querying non-existent session ID."""
    random_id = uuid.uuid4()
    response = client.get(f"/api/sessions/{random_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Session not found"


def test_invalid_uuid_returns_422() -> None:
    """Verify 422 validation error for invalid UUID path parameter."""
    response = client.get("/api/sessions/invalid-uuid-format")
    assert response.status_code == 422


@patch("app.services.extractor.extract_claims")
def test_session_analyze_workflow(mock_extract) -> None:
    """Verify full session creation, analysis, and detail fetching."""
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

    detail_res = client.get(f"/api/sessions/{session_id}")
    assert detail_res.status_code == 200
    assert len(detail_res.json()["analyses"]) == 1
