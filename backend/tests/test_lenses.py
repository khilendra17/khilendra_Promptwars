"""Tests for lens taxonomy, coverage calculation, and attention-gap scoring."""

from app.models.schemas import Claim
from app.services.lenses import (
    ALL_LENSES,
    calculate_attention_gap,
    calculate_coverage,
    get_silent_lenses,
)


def test_calculate_coverage() -> None:
    """Verify claim counts per decision lens."""
    claims = [
        Claim(
            id="c1",
            text="Salary is high",
            quote="Salary is high",
            kind="factor",
            lens="money",
            polarity=1,
            weight=4,
        ),
        Claim(
            id="c2",
            text="No free time",
            quote="No free time",
            kind="factor",
            lens="time",
            polarity=-1,
            weight=3,
        ),
    ]
    coverage = calculate_coverage(claims)
    assert coverage["money"] == 1
    assert coverage["time"] == 1
    assert coverage["health_energy"] == 0
    assert len(coverage) == 12


def test_attention_gap_and_silent_lenses() -> None:
    """Verify attention gap calculation and identification of silent lenses."""
    coverage = {lens: 0 for lens in ALL_LENSES}
    coverage["money"] = 2
    coverage["time"] = 1

    gap = calculate_attention_gap(coverage)
    silent = get_silent_lenses(coverage)

    # 10 out of 12 silent -> 10/12 = 0.83
    assert gap == 0.83
    assert len(silent) == 10
    assert "money" not in silent
    assert "time" not in silent
    assert "health_energy" in silent
