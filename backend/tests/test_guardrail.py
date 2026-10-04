"""Tests for guardrail non-recommendation and quote grounding verifiers."""

from app.models.schemas import BlindSpot
from app.services.guardrail import (
    contains_recommendation,
    validate_blind_spots,
    verify_quote_substring,
)


def test_contains_recommendation() -> None:
    """Verify detection of forbidden recommendation phrasing."""
    assert contains_recommendation("I think you should take Option A.")
    assert contains_recommendation("We recommend relocating immediately.")
    assert contains_recommendation("The best choice for you is software.")
    assert not contains_recommendation("This lens compares financial impact and risk.")


def test_verify_quote_substring() -> None:
    """Verify exact substring checking against user reasoning."""
    user_text = "I am choosing between staying at my current job or moving to Paris."
    assert verify_quote_substring("staying at my current job", user_text)
    assert not verify_quote_substring("moving to London", user_text)


def test_validate_blind_spots() -> None:
    """Verify filtering out invalid or non-grounded blind spots."""
    user_text = "The stipend is $5000 a month but rent is expensive."

    valid_spot = BlindSpot(
        id="b1",
        type="assumption",
        lens="money",
        evidence_quotes=["stipend is $5000 a month"],
        why_it_matters="High financial assumption.",
    )

    invalid_quote_spot = BlindSpot(
        id="b2",
        type="assumption",
        lens="money",
        evidence_quotes=["fake quote not in text"],
        why_it_matters="Unanchored.",
    )

    advisory_spot = BlindSpot(
        id="b3",
        type="silent",
        lens="health_energy",
        evidence_quotes=[],
        why_it_matters="You should take care of your health.",
    )

    result = validate_blind_spots([valid_spot, invalid_quote_spot, advisory_spot], user_text)
    assert len(result) == 1
    assert result[0].id == "b1"
