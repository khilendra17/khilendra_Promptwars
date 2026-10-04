"""Questioner service generating open-ended questions for blind spots via Gemini."""

import logging
import uuid

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.config import settings
from app.models.schemas import BlindSpot, Question
from app.services.guardrail import contains_recommendation
from app.services.prompts import QUESTIONER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class QuestionItem(BaseModel):
    """Temporary schema for question generation."""

    blind_spot_id: str
    question_text: str


class QuestionList(BaseModel):
    """Wrapper for list of generated questions."""

    questions: list[QuestionItem]


def generate_questions(
    blind_spots: list[BlindSpot], reasoning: str
) -> list[Question]:
    """Generate 1-2 open-ended non-leading questions per blind spot (max 8 total)."""
    if not blind_spots or not settings.gemini_api_key:
        return _fallback_questions(blind_spots)

    client = genai.Client(api_key=settings.gemini_api_key)
    spots_desc = "\n".join(
        f"- ID: {b.id}, Type: {b.type}, Lens: {b.lens}, Why: {b.why_it_matters}"
        for b in blind_spots[:6]
    )
    prompt = f"User Reasoning:\n{reasoning}\n\nBlind Spots:\n{spots_desc}"

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=QUESTIONER_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=QuestionList,
                temperature=0.3,
            ),
        )
        parsed = QuestionList.model_validate_json(response.text)
        result: list[Question] = []
        for item in parsed.questions[:8]:
            if not contains_recommendation(item.question_text):
                q_id = f"q_{uuid.uuid4().hex[:6]}"
                result.append(
                    Question(
                        id=q_id,
                        blind_spot_id=item.blind_spot_id,
                        text=item.question_text,
                    )
                )
        return result
    except Exception as exc:
        logger.error(f"Gemini question generation failed: {exc}")
        return _fallback_questions(blind_spots)


def _fallback_questions(blind_spots: list[BlindSpot]) -> list[Question]:
    """Rule-based fallback non-leading questions when LLM is unavailable."""
    questions: list[Question] = []
    for b in blind_spots[:6]:
        q_id = f"q_{uuid.uuid4().hex[:6]}"
        if b.type == "silent":
            text = f"How might the {b.lens.replace('_', ' ')} dimension impact your decision long term?"
        elif b.type == "assumption":
            text = f"What evidence would change your confidence in the assumption under {b.lens.replace('_', ' ')}?"
        else:
            text = "How do you reconcile the conflicting factors identified in your reasoning?"
        questions.append(Question(id=q_id, blind_spot_id=b.id, text=text))
    return questions
