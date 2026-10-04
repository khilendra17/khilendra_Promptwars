"""API route definitions for session management, analysis, and answers."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session, select

from app.db import get_session
from app.models.db_models import AnalysisRecord, AnswerRecord, SessionRecord
from app.models.schemas import AnswerCreate, SessionCreate
from app.services.pipeline import run_pipeline

router = APIRouter(prefix="/api", tags=["sessions"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/sessions", status_code=201)
def create_session(
    payload: SessionCreate, db: Session = Depends(get_session)
) -> dict[str, str]:
    """Create a new decision session."""
    session_rec = SessionRecord(
        decision_title=payload.decision_title,
        options=payload.options,
        reasoning=payload.reasoning,
        context=payload.context,
        status="pending",
    )
    db.add(session_rec)
    db.commit()
    db.refresh(session_rec)
    return {"id": str(session_rec.id)}


@router.post("/sessions/{session_id}/analyze")
@limiter.limit("10/minute")
def analyze_session(
    request: Request,
    session_id: uuid.UUID,
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Run pipeline and produce analysis version 1."""
    session_rec = db.get(SessionRecord, session_id)
    if not session_rec:
        raise HTTPException(status_code=404, detail="Session not found")

    session_rec.status = "running"
    db.add(session_rec)
    db.commit()

    try:
        output = run_pipeline(
            title=session_rec.decision_title,
            options=session_rec.options,
            reasoning=session_rec.reasoning,
            context=session_rec.context,
        )

        analysis_rec = AnalysisRecord(
            session_id=session_id,
            version=1,
            claims=[c.model_dump() for c in output.claims],
            relations=[r.model_dump() for r in output.relations],
            coverage=output.coverage,
            blind_spots=[b.model_dump() for b in output.blind_spots],
            conflicts=[c.model_dump() for c in output.conflicts],
            fragility=[f.model_dump() for f in output.fragility],
            questions=[q.model_dump() for q in output.questions],
            attention_gap=output.attention_gap,
        )
        session_rec.status = "done"
        db.add(analysis_rec)
        db.add(session_rec)
        db.commit()
        db.refresh(analysis_rec)
        return analysis_rec.model_dump()
    except Exception as exc:
        session_rec.status = "failed"
        db.add(session_rec)
        db.commit()
        raise HTTPException(
            status_code=500, detail=f"Analysis failed: {exc}"
        ) from exc


@router.post("/sessions/{session_id}/answers")
def submit_answers(
    session_id: uuid.UUID,
    payload: AnswerCreate,
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Submit answer to a question and trigger updated analysis version n+1."""
    session_rec = db.get(SessionRecord, session_id)
    if not session_rec:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get latest analysis version
    stmt = (
        select(AnalysisRecord)
        .where(AnalysisRecord.session_id == session_id)
        .order_by(AnalysisRecord.version.desc())
    )
    latest = db.exec(stmt).first()
    latest_version = latest.version if latest else 1

    ans_rec = AnswerRecord(
        analysis_id=latest.id if latest else session_id,
        question_id=payload.question_id,
        answer_text=payload.answer_text,
    )
    db.add(ans_rec)

    # Re-run pipeline with appended answer text
    combined_reasoning = (
        f"{session_rec.reasoning}\n\nAdditional clarification: {payload.answer_text}"
    )
    output = run_pipeline(
        title=session_rec.decision_title,
        options=session_rec.options,
        reasoning=combined_reasoning,
        context=session_rec.context,
    )

    new_analysis = AnalysisRecord(
        session_id=session_id,
        version=latest_version + 1,
        claims=[c.model_dump() for c in output.claims],
        relations=[r.model_dump() for r in output.relations],
        coverage=output.coverage,
        blind_spots=[b.model_dump() for b in output.blind_spots],
        conflicts=[c.model_dump() for c in output.conflicts],
        fragility=[f.model_dump() for f in output.fragility],
        questions=[q.model_dump() for q in output.questions],
        attention_gap=output.attention_gap,
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    return new_analysis.model_dump()


@router.get("/sessions/{session_id}")
def get_session_detail(
    session_id: uuid.UUID, db: Session = Depends(get_session)
) -> dict[str, Any]:
    """Get session details along with all analysis versions."""
    session_rec = db.get(SessionRecord, session_id)
    if not session_rec:
        raise HTTPException(status_code=404, detail="Session not found")

    stmt = (
        select(AnalysisRecord)
        .where(AnalysisRecord.session_id == session_id)
        .order_by(AnalysisRecord.version.asc())
    )
    analyses = db.exec(stmt).all()
    return {
        "session": session_rec.model_dump(),
        "analyses": [a.model_dump() for a in analyses],
    }


@router.get("/sessions/{session_id}/status")
def get_session_status(
    session_id: uuid.UUID, db: Session = Depends(get_session)
) -> dict[str, str]:
    """Get current processing status of session for polling."""
    session_rec = db.get(SessionRecord, session_id)
    if not session_rec:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": session_rec.status}
