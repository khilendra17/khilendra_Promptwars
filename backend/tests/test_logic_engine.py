"""Tests for Z3 logic engine: UNSAT core conflict detection and assumption fragility."""

from app.models.schemas import Claim, Relation
from app.services.logic_engine import analyze_fragility, find_conflicts


def test_find_conflicts_unsat_core() -> None:
    """Verify that known UNSAT claim set produces expected Z3 conflict core."""
    claims = [
        Claim(
            id="c1",
            text="Must work remotely",
            quote="Must work remotely",
            kind="constraint",
            lens="dependency_control",
            polarity=1,
            weight=5,
        ),
        Claim(
            id="c2",
            text="Job requires full in-office presence",
            quote="Job requires full in-office presence",
            kind="constraint",
            lens="dependency_control",
            polarity=1,
            weight=5,
        ),
    ]
    # Relation: c1 excludes c2
    relations = [Relation(kind="excludes", a="c1", b="c2")]

    conflicts = find_conflicts(claims, relations)
    assert len(conflicts) == 1
    assert set(conflicts[0].claim_ids) == {"c1", "c2"}


def test_find_conflicts_sat() -> None:
    """Verify consistent SAT claims return no conflicts."""
    claims = [
        Claim(
            id="c1",
            text="High pay",
            quote="High pay",
            kind="factor",
            lens="money",
            polarity=1,
            weight=4,
        ),
        Claim(
            id="c2",
            text="Great growth",
            quote="Great growth",
            kind="factor",
            lens="learning_growth",
            polarity=1,
            weight=4,
        ),
    ]
    relations = [Relation(kind="implies", a="c1", b="c2")]
    conflicts = find_conflicts(claims, relations)
    assert len(conflicts) == 0


def test_analyze_fragility_flips_leader() -> None:
    """Verify flipping a load-bearing assumption changes option leadership."""
    claims = [
        Claim(
            id="c1",
            text="Stipend is very high",
            quote="Stipend is very high",
            kind="assumption",
            lens="money",
            option="Option A",
            polarity=1,
            weight=5,
        ),
        Claim(
            id="c2",
            text="Great commute",
            quote="Great commute",
            kind="factor",
            lens="time",
            option="Option B",
            polarity=1,
            weight=3,
        ),
    ]
    fragility = analyze_fragility(claims, options=["Option A", "Option B"])
    assert len(fragility) == 1
    assert fragility[0].assumption_id == "c1"
    assert fragility[0].flips_leader is True
    assert fragility[0].leader_before == "Option A"
    assert fragility[0].leader_after == "Option B"
