"""Integration tests for the SCOTOMA analysis pipeline."""

from unittest.mock import patch

from app.models.schemas import Claim, ClaimGraph, Relation
from app.services.pipeline import run_pipeline


@patch("app.services.pipeline.extract_claims")
def test_pipeline_full_execution(mock_extract) -> None:
    """Verify end-to-end pipeline execution with claims, Z3 logic, and guardrails."""
    reasoning = (
        "I want to choose the high paying internship near my home because stipend is high. "
        "However, I must work remotely for my family."
    )
    mock_extract.return_value = ClaimGraph(
        claims=[
            Claim(
                id="c1",
                text="Stipend is very high",
                quote="stipend is high",
                kind="assumption",
                lens="money",
                option="Internship",
                polarity=1,
                weight=5,
            ),
            Claim(
                id="c2",
                text="Must work remotely",
                quote="must work remotely",
                kind="constraint",
                lens="dependency_control",
                option="Remote Job",
                polarity=1,
                weight=4,
            ),
        ],
        relations=[Relation(kind="excludes", a="c1", b="c2")],
    )

    output = run_pipeline(
        title="Internship vs Remote",
        options=["Internship", "Remote Job"],
        reasoning=reasoning,
    )

    assert len(output.claims) == 2
    assert "money" in output.coverage
    assert "dependency_control" in output.coverage
    assert output.attention_gap > 0.0
    assert len(output.blind_spots) > 0
