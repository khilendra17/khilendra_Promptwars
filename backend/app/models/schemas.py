"""Pydantic schemas for request/response bodies and domain entities."""

from typing import Literal

from pydantic import BaseModel, Field

LensId = Literal[
    "money",
    "time",
    "health_energy",
    "reversibility",
    "relationships",
    "opportunity_cost",
    "identity_values",
    "learning_growth",
    "risk_downside",
    "dependency_control",
    "ethics_fairness",
    "future_regret",
]


class Claim(BaseModel):
    """Extracted claim or belief from user reasoning."""

    id: str
    text: str
    quote: str
    kind: Literal["factor", "assumption", "constraint", "preference"]
    lens: LensId
    option: str | None = None
    polarity: Literal[-1, 0, 1]
    weight: int = Field(ge=1, le=5, default=3)


class Relation(BaseModel):
    """Logical relation between two claims."""

    kind: Literal["implies", "excludes", "requires"]
    a: str
    b: str


class ClaimGraph(BaseModel):
    """Extracted claim graph from Gemini LLM."""

    claims: list[Claim] = Field(default_factory=list)
    relations: list[Relation] = Field(default_factory=list)


class BlindSpot(BaseModel):
    """Detected decision blind spot."""

    id: str
    type: Literal["silent", "assumption", "conflict"]
    lens: LensId
    evidence_quotes: list[str] = Field(default_factory=list)
    why_it_matters: str
    question_ids: list[str] = Field(default_factory=list)


class Conflict(BaseModel):
    """Z3 proven logical contradiction."""

    claim_ids: list[str]
    explanation: str


class Fragility(BaseModel):
    """Load-bearing assumption fragility score."""

    assumption_id: str
    flips_leader: bool
    leader_before: str
    leader_after: str
    score: float = Field(ge=0.0, le=1.0)


class Question(BaseModel):
    """Non-leading open-ended question anchored to blind spot."""

    id: str
    blind_spot_id: str
    text: str


class AnalysisOutput(BaseModel):
    """Complete analysis output from pipeline."""

    claims: list[Claim]
    relations: list[Relation]
    coverage: dict[str, int]
    blind_spots: list[BlindSpot]
    conflicts: list[Conflict]
    fragility: list[Fragility]
    questions: list[Question]
    attention_gap: float


class SessionCreate(BaseModel):
    """Request payload to create a decision session."""

    decision_title: str = Field(min_length=3, max_length=200)
    options: list[str] = Field(min_length=2, max_length=4)
    reasoning: str = Field(min_length=50, max_length=3000)
    context: str | None = Field(default=None, max_length=1000)


class AnswerCreate(BaseModel):
    """Request payload to submit an answer to a question."""

    question_id: str
    answer_text: str = Field(min_length=1, max_length=2000)
