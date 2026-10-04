"""Gemini extractor service producing structured ClaimGraph from user reasoning."""

import logging

from google import genai
from google.genai import types

from app.config import settings
from app.models.schemas import ClaimGraph
from app.services.guardrail import verify_quote_substring
from app.services.prompts import EXTRACTION_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


def extract_claims(reasoning: str, title: str, options: list[str]) -> ClaimGraph:
    """Extract claims and relations using Gemini with structured JSON schema."""
    if not settings.gemini_api_key:
        logger.warning("No GEMINI_API_KEY set; returning empty ClaimGraph fallback.")
        return ClaimGraph()

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = f"Decision Title: {title}\nOptions: {', '.join(options)}\nReasoning:\n{reasoning}"

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=EXTRACTION_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=ClaimGraph,
                temperature=0.2,
            ),
        )
        graph = ClaimGraph.model_validate_json(response.text)
    except Exception as exc:
        logger.error(f"Gemini extraction failed: {exc}")
        return ClaimGraph()

    # Filter out claims whose quotes are not exact substrings of user reasoning
    valid_claims = [c for c in graph.claims if verify_quote_substring(c.quote, reasoning)]
    valid_ids = {c.id for c in valid_claims}
    valid_relations = [
        r for r in graph.relations if r.a in valid_ids and r.b in valid_ids
    ]

    return ClaimGraph(claims=valid_claims, relations=valid_relations)
