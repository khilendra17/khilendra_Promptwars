"""Guardrail verifier ensuring non-advisory tone and quote grounding."""

import re

from app.models.schemas import BlindSpot

FORBIDDEN_PATTERNS = [
    r"\byou should\b",
    r"\bi recommend\b",
    r"\bwe recommend\b",
    r"\bbest choice\b",
    r"\bgo with\b",
    r"\byou ought to\b",
    r"\bwe advise\b",
    r"\bshould choose\b",
    r"\byou must choose\b",
]

_COMPILED_FORBIDDEN = [re.compile(p, re.IGNORECASE) for p in FORBIDDEN_PATTERNS]


def contains_recommendation(text: str) -> bool:
    """Check if text contains forbidden recommendation language."""
    for pattern in _COMPILED_FORBIDDEN:
        if pattern.search(text):
            return True
    return False


def verify_quote_substring(quote: str, user_text: str) -> bool:
    """Verify that quote exists verbatim as a substring in user text."""
    return quote in user_text


def validate_blind_spots(
    blind_spots: list[BlindSpot], user_text: str
) -> list[BlindSpot]:
    """Filter and validate blind spots against guardrail rules."""
    valid_spots: list[BlindSpot] = []

    for spot in blind_spots:
        # Reject if explanation contains recommendation language
        if contains_recommendation(spot.why_it_matters):
            continue

        # Verify all evidence quotes exist in user text
        quotes_valid = True
        for q in spot.evidence_quotes:
            if not verify_quote_substring(q, user_text):
                quotes_valid = False
                break

        if not quotes_valid:
            continue

        # Proof type verification
        if spot.type == "silent" and spot.evidence_quotes:
            continue

        valid_spots.append(spot)

    return valid_spots
