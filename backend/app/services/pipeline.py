"""SCOTOMA analysis pipeline orchestrating extraction, logic, and guardrails."""

import uuid

from app.models.schemas import AnalysisOutput, BlindSpot
from app.services.extractor import extract_claims
from app.services.guardrail import validate_blind_spots
from app.services.lenses import (
    calculate_attention_gap,
    calculate_coverage,
    get_silent_lenses,
)
from app.services.logic_engine import analyze_fragility, find_conflicts
from app.services.questioner import generate_questions


def run_pipeline(
    title: str, options: list[str], reasoning: str, context: str | None = None
) -> AnalysisOutput:
    """Run full SCOTOMA analysis pipeline on user decision input."""
    # 1. Extraction
    graph = extract_claims(reasoning, title, options)

    # 2. Lens Coverage & Attention Gap
    coverage = calculate_coverage(graph.claims)
    attention_gap = calculate_attention_gap(coverage)
    silent = get_silent_lenses(coverage)

    # 3. Z3 Logic Engine (Conflicts & Fragility)
    conflicts = find_conflicts(graph.claims, graph.relations)
    fragility = analyze_fragility(graph.claims, options)

    # 4. Construct Blind Spots
    blind_spots: list[BlindSpot] = []
    for s_lens in silent:
        b_id = f"bs_{uuid.uuid4().hex[:6]}"
        blind_spots.append(
            BlindSpot(
                id=b_id,
                type="silent",
                lens=s_lens,
                evidence_quotes=[],
                why_it_matters=f"Silent lens: {s_lens.replace('_', ' ').title()}. You mentioned no factors covering this area.",
            )
        )

    for frag in fragility:
        if frag.flips_leader:
            asm_claim = next((c for c in graph.claims if c.id == frag.assumption_id), None)
            if asm_claim:
                b_id = f"bs_{uuid.uuid4().hex[:6]}"
                blind_spots.append(
                    BlindSpot(
                        id=b_id,
                        type="assumption",
                        lens=asm_claim.lens,
                        evidence_quotes=[asm_claim.quote],
                        why_it_matters=f"Load-bearing assumption in quote '{asm_claim.quote}'. If invalid, leader flips from {frag.leader_before} to {frag.leader_after}.",
                    )
                )

    for conf in conflicts:
        quotes = [c.quote for c in graph.claims if c.id in conf.claim_ids]
        first_lens = next((c.lens for c in graph.claims if c.id in conf.claim_ids), "risk_downside")
        b_id = f"bs_{uuid.uuid4().hex[:6]}"
        blind_spots.append(
            BlindSpot(
                id=b_id,
                type="conflict",
                lens=first_lens,
                evidence_quotes=quotes,
                why_it_matters=conf.explanation,
            )
        )

    # 5. Question Generation
    questions = generate_questions(blind_spots, reasoning)
    for q in questions:
        for b in blind_spots:
            if b.id == q.blind_spot_id:
                b.question_ids.append(q.id)

    # 6. Guardrail Verification
    valid_spots = validate_blind_spots(blind_spots, reasoning)

    return AnalysisOutput(
        claims=graph.claims,
        relations=graph.relations,
        coverage=coverage,
        blind_spots=valid_spots,
        conflicts=conflicts,
        fragility=fragility,
        questions=questions,
        attention_gap=attention_gap,
    )
