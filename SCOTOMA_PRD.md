# SCOTOMA — PRD for "The Blind Spot" (PromptWars)

> *Scotoma (n.): a blind spot in the visual field. The brain fills it in so you never notice it.*
> This document is the single source of truth. Build exactly this. Do not add features outside it.

---

## 1. Product in One Paragraph

SCOTOMA is a web app where a user describes a decision and their reasoning. The system **never recommends an option**. Instead it (a) extracts the user's claims and assumptions with an LLM, (b) hands them to a **formal logic solver (Z3)** that finds real contradictions and tests which assumptions the decision hinges on, (c) maps which of 12 "decision lenses" the user never mentioned, and (d) returns sharp questions anchored to the user's own words. The user answers, the "vision field" clears, and the coverage score updates.

**Hard rule:** output must never contain "you should / I recommend / choose X". A guardrail enforces this (see 5.5).

## 2. Hackathon Constraints → Design Decisions

| Constraint | Decision |
|---|---|
| 3 hours | One repo, one container, one deploy link. Scope in Section 9 is the MVP. |
| Must be deployed | Single Docker image (FastAPI serves built React). Deploy on Google Cloud Run or Render. |
| No dataset | Fixed lens taxonomy (Section 5.2) + 3 built-in demo scenarios (internship, relocation, quit-job). |
| Meaningful AI | LLM extracts and questions; Z3 reasons. Neuro-symbolic, not "wrapper around a prompt". |
| Code quality is auto-scored | Follow Section 8 strictly. |

## 2.1 Evaluator-Friendly Checklist (non-negotiable)

- TypeScript `strict: true`; Python fully type-hinted; Pydantic models for every request/response
- `ruff` + `eslint` + `prettier` clean; `pytest` and `vitest` tests that pass
- Small modules (<150 lines), single responsibility, docstrings on public functions
- No secrets in repo; `.env.example` provided; input validation and rate limiting
- README with architecture diagram (Mermaid), run steps, env vars, test commands
- GitHub Actions CI (lint + test); clean conventional commits
- Accessibility: keyboard navigable, ARIA labels, contrast AA, `prefers-reduced-motion` respected

---

## 3. Technical Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript (strict), Zustand, plain CSS variables (no default Tailwind palette) |
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLModel + SQLite, slowapi (rate limit) |
| LLM | Google Gemini via `google-genai` SDK, structured JSON output (`response_schema`). Model name from env `GEMINI_MODEL` |
| **Rare OSS #1** | **Z3 Theorem Prover (`z3-solver`)**: SMT solver for contradiction detection via *unsat cores* and assumption stress-testing |
| **Rare OSS #2** | **OGL** (tiny WebGL library, ~29kb): renders the GLSL "vision field" shader. Fallback to a CSS radial-gradient if WebGL is unavailable |
| Deploy | Multi-stage Dockerfile → Cloud Run / Render |
| Tests | pytest, vitest, React Testing Library |

### 3.1 The Two Technical Novelties

**Novelty 1 — Neuro-symbolic Contradiction Engine (LLM + Z3).**
The LLM only *translates* the user's prose into structured claims and relations (`implies`, `excludes`, `requires`). Z3 then asserts the user's stated claims as hard facts and checks satisfiability. If UNSAT, the **unsat core** returns the minimal set of claims that cannot all be true together. Result: contradictions are *proven and reproducible*, not guessed by a language model. Each conflict cites exact quotes.

*(Hindi-English: LLM sirf "samajhta" hai, asli logic Z3 check karta hai. Isliye answer vibes pe nahi, proof pe based hai.)*

**Novelty 2 — Load-Bearing Assumption Analysis + Attention-Gap Score.**
Every assumption is a boolean literal in Z3. For each one we flip it to false and re-evaluate a weighted-score model of the user's options. If the leading option changes, that assumption is **load-bearing** and gets a *fragility score*. Separately, the **Attention-Gap Score** = share of the 12 lenses with zero mentions, weighted by lens relevance. Both are deterministic numbers shown in the UI.

### 3.2 The "Extremely Unique" Approach — Quote-Anchored Silence Detection

Most tools list generic pros and cons. SCOTOMA detects three kinds of blind spots, and each must be provable:

1. **Silent** — a lens the user never touched (provable: zero claims map to it).
2. **Anchored assumption** — an unstated belief tied to an exact quote from the user (guardrail checks the quote is a real substring of the input).
3. **Conflict** — two or more quotes proven incompatible by Z3.

Nothing is shown unless it passes the verifier. The user's own sentence is rendered as an **X-ray**: underlined spans link to the blind spots they caused.

---

## 4. App Flow

```
[Landing] → [Describe Decision] → [Scanning] → [X-ray Result] → [Re-examine loop] → [Summary/Export]
```

1. **Landing** — title, one-line pitch, three demo scenario chips, "Begin" button.
2. **Describe** — 4 fields: *Decision* (short title), *Options* (2–4 chips), *My reasoning* (textarea, 50–3000 chars), *Constraints/context* (optional). Inline validation, character counter.
3. **Scanning** — shader field animates while backend runs the pipeline (5 steps listed live: Extracting claims → Mapping lenses → Proving conflicts → Stress-testing assumptions → Writing questions). Use SSE or polling on a status field.
4. **X-ray Result** (main screen, 3 columns on desktop, stacked on mobile):
   - *Left:* user's text with underlined anchored spans.
   - *Center:* **Vision Field** (OGL): 12 lens "dots" on a perimetry-style circle. Mentioned lenses glow lime; silent lenses are dark vermilion voids that pulse slowly. Hover/focus a dot shows lens + question count.
   - *Right:* Blind-spot cards (type badge, evidence quote, why it matters, 1–2 questions), then Conflicts (the proven set), then Fragility bars per assumption.
5. **Re-examine** — user types an answer under any question. "Re-scan" sends answers back, creating `analysis version + 1`. Field updates, scores animate, a version timeline shows Attention-Gap going down.
6. **Summary** — clean one-page view (printable, "Copy as text"). Ends with: *"This tool does not decide for you."*

Empty/error states: network error toast with retry; LLM failure → friendly fallback card; guardrail rejection → regenerate once, then show the lens-only result.

---

## 5. Backend Specification

### 5.1 Folder Structure

```
scotoma/
├─ backend/
│  ├─ app/
│  │  ├─ main.py              # FastAPI app, CORS, static mount, routers
│  │  ├─ config.py            # pydantic-settings (env)
│  │  ├─ api/routes.py        # endpoints only
│  │  ├─ models/              # SQLModel tables + Pydantic schemas
│  │  ├─ services/
│  │  │  ├─ extractor.py      # Gemini → ClaimGraph
│  │  │  ├─ lenses.py         # taxonomy + coverage calc
│  │  │  ├─ logic_engine.py   # Z3: conflicts + fragility
│  │  │  ├─ questioner.py     # Gemini → questions
│  │  │  ├─ guardrail.py      # verifier (5.5)
│  │  │  └─ pipeline.py       # orchestrates all steps
│  │  └─ db.py
│  └─ tests/
├─ frontend/src/{components,features,store,styles,lib,types}
├─ Dockerfile  ├─ README.md  ├─ .env.example  └─ .github/workflows/ci.yml
```

### 5.2 Lens Taxonomy (fixed constant, 12 lenses)

`money`, `time`, `health_energy`, `reversibility`, `relationships`, `opportunity_cost`, `identity_values`, `learning_growth`, `risk_downside`, `dependency_control`, `ethics_fairness`, `future_regret`.

### 5.3 Data Schema

**Tables (SQLModel / SQLite)**

```
sessions(id UUID PK, created_at, decision_title, options JSON, reasoning TEXT, context TEXT, status ENUM[pending,running,done,failed])
analyses(id UUID PK, session_id FK, version INT, claims JSON, relations JSON, coverage JSON, blind_spots JSON,
         conflicts JSON, fragility JSON, questions JSON, attention_gap FLOAT, created_at)
answers(id UUID PK, analysis_id FK, question_id TEXT, answer_text TEXT, created_at)
```

**Core Pydantic models**

```python
class Claim(BaseModel):
    id: str                       # "c1"
    text: str                     # normalized claim
    quote: str                    # exact substring from user input
    kind: Literal["factor","assumption","constraint","preference"]
    lens: LensId
    option: str | None            # option it supports/opposes
    polarity: Literal[-1, 0, 1]
    weight: int                   # 1-5, stated or inferred

class Relation(BaseModel):
    kind: Literal["implies","excludes","requires"]
    a: str; b: str                # claim ids

class BlindSpot(BaseModel):
    id: str
    type: Literal["silent","assumption","conflict"]
    lens: LensId
    evidence_quotes: list[str]    # [] only for "silent"
    why_it_matters: str
    question_ids: list[str]

class Conflict(BaseModel):
    claim_ids: list[str]          # Z3 unsat core
    explanation: str

class Fragility(BaseModel):
    assumption_id: str
    flips_leader: bool
    leader_before: str
    leader_after: str
    score: float                  # 0-1

class Question(BaseModel):
    id: str; blind_spot_id: str; text: str   # open-ended, non-leading
```

### 5.4 Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/sessions` | Create session (validated input) → `{id}` |
| POST | `/api/sessions/{id}/analyze` | Run pipeline → `Analysis` (version 1) |
| POST | `/api/sessions/{id}/answers` | Save answers, re-run → `Analysis` (version n+1) |
| GET | `/api/sessions/{id}` | Session + all analysis versions |
| GET | `/api/sessions/{id}/status` | Pipeline step for Scanning screen |
| GET | `/healthz` | Health check |

Rate limit 10 req/min/IP on analyze. Request size limit. CORS restricted via env.

### 5.5 Pipeline and Guardrail

1. `extractor`: Gemini with `response_schema = ClaimGraph` (temperature 0.2). Drop any claim whose `quote` is not an exact substring of the user text.
2. `lenses`: count claims per lens → `coverage`; silent lenses = 0 claims; `attention_gap` = weighted share of silent lenses.
3. `logic_engine`: Z3 booleans per claim; add relations as implications; assert stated claims with `assert_and_track`; if `unsat` → `unsat_core()` → Conflicts. Fragility: for each assumption, check with it negated and recompute option scores (Σ weight × polarity over true claims); compare leader.
4. `questioner`: Gemini creates 1–2 non-leading questions per blind spot (max 8 total).
5. `guardrail`: (a) regex + LLM-judge reject text containing recommendation language ("you should", "I recommend", "best choice", "go with"); (b) every quote must be a substring of the input; (c) every blind spot needs a type-specific proof. On failure: regenerate once, then drop the offending item.

Prompts live in `services/prompts.py` as constants (never inline). All LLM calls have timeout (20s), retry (2), and typed error handling.

---

## 6. UI / UX Design System — "Perimetry Darkroom"

**Concept:** an ophthalmology visual-field test crossed with an analogue darkroom, on **warm bone paper** (deliberately NOT dark-mode purple/blue gradient AI look). Editorial, tactile, slightly brutalist.

**Do NOT use:** purple/indigo gradients, glassmorphism, Inter/Roboto, default Tailwind colors, rounded-everything cards, emoji icons.

### Palette (CSS variables)

```css
:root {
  --bone:        #E9E1CE;  /* page background, paper */
  --ink:         #17140F;  /* text */
  --plum-night:  #2A1B2E;  /* shader field + dark panels */
  --vermilion:   #FF4A1C;  /* blind spots / danger flare */
  --verdigris:   #1F6F5C;  /* covered lenses / safe */
  --uv-lime:     #D6F23A;  /* highlights, active focus */
  --oxide:       #9B5B2E;  /* secondary text, borders */
  --fog:         #C9BFA6;  /* dividers, disabled */
}
```

Contrast: ink on bone ≥ 12:1; vermilion text only on plum-night or large sizes.

### Typography
- Headings: **Young Serif** (Google Fonts), large, tight leading
- UI/body: **Martian Mono** at 14–15px for labels and data; body paragraphs in Young Serif or system serif for readability
- Numbers (scores) very large, mono, tabular

### Signature Elements
- **Vision Field** (OGL fragment shader): circular plum-night field with fine noise grain; lime dots for covered lenses; vermilion "voids" use a soft radial hole with slow flicker. Respect `prefers-reduced-motion` (static render).
- **X-ray underlines**: hand-drawn wavy underline (SVG) in vermilion for blind-spot spans, lime highlight on hover.
- **Cards** have hard 2px ink borders, offset hard shadow (4px 4px 0 ink), square corners, paper grain texture via CSS.
- **Scores** displayed as large mono numerals with a thin "ruler" scale, not donut charts.
- Microcopy tone: calm, precise, never advisory. Example: "Silent lens: Reversibility. You described no way back out."

### Layout
Max width 1280px; grid 12 columns; mobile: single column, Vision Field on top. Focus ring: 3px uv-lime outline offset 2px.

---

## 7. Demo Scenarios (built-in, no dataset needed)

1. **Internship** — the problem-statement example (stipend, near home, industry exposure; ignores academics, mentorship, long-term prospects).
2. **Relocation** — taking a higher-paying job in another city.
3. **Quit to startup** — leaving a stable job.

Each is a JSON file with pre-filled input to make judging fast.

---

## 8. Testing Requirements

- `test_logic_engine.py`: known-UNSAT claim set returns the exact expected core; SAT set returns none; flipping assumption changes leader as expected.
- `test_guardrail.py`: rejects "you should take it"; rejects non-substring quote; accepts valid output.
- `test_lenses.py`: coverage and attention gap math.
- `test_api.py`: validation errors (short text, >4 options), rate limit, happy path with mocked Gemini.
- Frontend: form validation, X-ray renders spans, Vision Field falls back when WebGL missing.

## 9. MVP Scope and Time Plan (3 hours)

| Time | Deliverable |
|---|---|
| 0:00–0:20 | Repo scaffold, config, CI, design tokens, fonts |
| 0:20–1:10 | Backend pipeline: extractor → lenses → Z3 → questioner → guardrail, with tests |
| 1:10–2:00 | Frontend: Describe, Scanning, X-ray result, Vision Field |
| 2:00–2:25 | Re-examine loop + Summary |
| 2:25–2:50 | Dockerfile, deploy, smoke test the live link |
| 2:50–3:00 | README, final submission text |

**Cut first if late:** version timeline, SSE status (use polling), Summary export. **Never cut:** Z3 engine, guardrail, tests, deployment.

## 10. Acceptance Criteria

- Demo scenario 1 returns ≥3 blind spots, including silent lenses (e.g., learning_growth, future_regret) and an anchored assumption on the stipend.
- No response ever contains a recommendation.
- Every displayed quote exists verbatim in the user's input.
- `pytest` and `vitest` pass; lint clean; CI green.
- Live URL loads in <3s and completes an analysis in <15s.

## 11. Submission Text (draft for the form)

> SCOTOMA helps people see what they can't see in their own reasoning. Gemini turns a decision into structured claims; a Z3 theorem prover then proves contradictions and tests which assumptions the decision depends on; a quote-anchored verifier guarantees every blind spot is grounded in the user's words. It never decides for the user. Stack: React + TypeScript, FastAPI, Z3, OGL (WebGL), Gemini.
