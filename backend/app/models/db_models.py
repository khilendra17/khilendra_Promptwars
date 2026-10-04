"""SQLModel database table definitions for sessions, analyses, and answers."""

import uuid
from datetime import datetime, timezone
from typing import Any
from sqlmodel import Column, Field, JSON, SQLModel


def utc_now() -> datetime:
    """Return current UTC timestamp."""
    return datetime.now(timezone.utc)


class SessionRecord(SQLModel, table=True):
    """SQLModel table representing a decision session."""

    __tablename__ = "sessions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=utc_now)
    decision_title: str
    options: list[str] = Field(sa_column=Column(JSON))
    reasoning: str
    context: str | None = Field(default=None)
    status: str = Field(default="pending")  # pending, running, done, failed


class AnalysisRecord(SQLModel, table=True):
    """SQLModel table representing a single versioned analysis run."""

    __tablename__ = "analyses"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    session_id: uuid.UUID = Field(foreign_key="sessions.id", index=True)
    version: int = Field(default=1)
    claims: list[dict[str, Any]] = Field(sa_column=Column(JSON))
    relations: list[dict[str, Any]] = Field(sa_column=Column(JSON))
    coverage: dict[str, int] = Field(sa_column=Column(JSON))
    blind_spots: list[dict[str, Any]] = Field(sa_column=Column(JSON))
    conflicts: list[dict[str, Any]] = Field(sa_column=Column(JSON))
    fragility: list[dict[str, Any]] = Field(sa_column=Column(JSON))
    questions: list[dict[str, Any]] = Field(sa_column=Column(JSON))
    attention_gap: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=utc_now)


class AnswerRecord(SQLModel, table=True):
    """SQLModel table storing user answers to analysis questions."""

    __tablename__ = "answers"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    analysis_id: uuid.UUID = Field(foreign_key="analyses.id", index=True)
    question_id: str
    answer_text: str
    created_at: datetime = Field(default_factory=utc_now)
