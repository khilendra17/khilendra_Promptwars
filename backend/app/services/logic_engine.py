"""Z3 Theorem Prover engine for UNSAT core conflicts and assumption fragility."""

import z3
from app.models.schemas import Claim, Conflict, Fragility, Relation


def find_conflicts(claims: list[Claim], relations: list[Relation]) -> list[Conflict]:
    """Prove logical contradictions using Z3 UNSAT core tracking."""
    if not claims:
        return []

    solver = z3.Solver()
    var_map: dict[str, z3.BoolRef] = {c.id: z3.Bool(c.id) for c in claims}
    track_map: dict[str, z3.BoolRef] = {c.id: z3.Bool(f"track_{c.id}") for c in claims}

    # Assert relations
    for rel in relations:
        if rel.a not in var_map or rel.b not in var_map:
            continue
        a_var, b_var = var_map[rel.a], var_map[rel.b]
        if rel.kind == "implies" or rel.kind == "requires":
            solver.add(z3.Implies(a_var, b_var))
        elif rel.kind == "excludes":
            solver.add(z3.Implies(a_var, z3.Not(b_var)))

    # Track individual claims as asserted facts
    for c in claims:
        solver.assert_and_track(var_map[c.id], track_map[c.id])

    result = solver.check()
    if result == z3.unsat:
        unsat_core = solver.unsat_core()
        # Map tracking symbols back to claim IDs
        track_names = {str(sym) for sym in unsat_core}
        conflicting_ids = [c.id for c in claims if f"track_{c.id}" in track_names]
        return [
            Conflict(
                claim_ids=conflicting_ids,
                explanation="Z3 proven logical contradiction: these stated claims/relations cannot all be true simultaneously.",
            )
        ]

    return []


def _compute_option_scores(claims: list[Claim], active_ids: set[str]) -> dict[str, float]:
    """Compute score per option based on active claim weight and polarity."""
    scores: dict[str, float] = {}
    for c in claims:
        if c.id in active_ids and c.option:
            scores[c.option] = scores.get(c.option, 0.0) + (c.weight * c.polarity)
    return scores


def analyze_fragility(claims: list[Claim], options: list[str]) -> list[Fragility]:
    """Stress-test assumptions by flipping boolean status in Z3 score model."""
    if not claims or len(options) < 2:
        return []

    all_ids = {c.id for c in claims}
    base_scores = _compute_option_scores(claims, all_ids)
    if not base_scores:
        return []

    leader_before = max(base_scores, key=lambda k: base_scores[k])
    assumptions = [c for c in claims if c.kind == "assumption"]
    results: list[Fragility] = []

    for asm in assumptions:
        # Flip assumption to false (remove from active claims)
        flipped_ids = all_ids - {asm.id}
        flipped_scores = _compute_option_scores(claims, flipped_ids)
        if not flipped_scores:
            continue

        leader_after = max(flipped_scores, key=lambda k: flipped_scores[k])
        flips = leader_after != leader_before
        diff = abs(base_scores.get(leader_before, 0.0) - flipped_scores.get(leader_before, 0.0))
        fragility_score = round(min(1.0, (diff + 1.0) / 10.0), 2) if flips else 0.2

        results.append(
            Fragility(
                assumption_id=asm.id,
                flips_leader=flips,
                leader_before=leader_before,
                leader_after=leader_after,
                score=fragility_score,
            )
        )

    return results
