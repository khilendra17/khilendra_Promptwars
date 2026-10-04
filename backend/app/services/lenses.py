"""Lens taxonomy and coverage calculation services."""

from app.models.schemas import Claim, LensId

ALL_LENSES: list[LensId] = [
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

# Optional lens weightings for attention-gap score calculation (default = 1.0)
LENS_WEIGHTS: dict[LensId, float] = {lens: 1.0 for lens in ALL_LENSES}


def calculate_coverage(claims: list[Claim]) -> dict[str, int]:
    """Count extracted claims per decision lens."""
    counts: dict[str, int] = {lens: 0 for lens in ALL_LENSES}
    for claim in claims:
        if claim.lens in counts:
            counts[claim.lens] += 1
    return counts


def calculate_attention_gap(coverage: dict[str, int]) -> float:
    """Calculate weighted share of silent decision lenses (0 to 1 score)."""
    if not ALL_LENSES:
        return 0.0
    total_weight = sum(LENS_WEIGHTS.get(lens, 1.0) for lens in ALL_LENSES)
    silent_weight = sum(
        LENS_WEIGHTS.get(lens, 1.0)
        for lens, count in coverage.items()
        if count == 0 and lens in ALL_LENSES
    )
    return round(silent_weight / total_weight, 2)


def get_silent_lenses(coverage: dict[str, int]) -> list[LensId]:
    """Return list of lenses with 0 extracted claims."""
    return [lens for lens in ALL_LENSES if coverage.get(lens, 0) == 0]
