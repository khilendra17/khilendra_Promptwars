# SCOTOMA — The Blind Spot Analyzer

> *Scotoma (n.): a blind spot in the visual field. The brain fills it in so you never notice it.*

SCOTOMA is a neuro-symbolic decision analysis web application developed for PromptWars "The Blind Spot". It combines Gemini LLMs with the Z3 SMT Theorem Prover to detect unstated assumptions, logical contradictions, and silent decision lenses without ever making a recommendation.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    User([User]) <--> UI[React + Vite Frontend\nZustand State & OGL Shader]
    UI <--> API[FastAPI Backend\nREST & SSE Endpoints]
    
    subgraph Pipeline [SCOTOMA Pipeline]
        API --> Extractor[Extractor Service\nGemini Structured JSON]
        Extractor --> LensEngine[Lens Taxonomy Engine\n12 Decision Lenses]
        Extractor --> Z3[Z3 Logic Engine\nUNSAT Core & Fragility Analysis]
        LensEngine --> Questioner[Questioner Service\nGemini Non-leading Questions]
        Z3 --> Questioner
        Questioner --> Guardrail[Guardrail Verifier\nQuote Grounding & Silence Filter]
    end

    Guardrail --> DB[(SQLModel / SQLite)]
    API <--> DB
```

---

## ⚡ Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and set your Google Gemini API key:

```bash
cp .env.example .env
```

### 2. Run Backend & Frontend locally

```bash
# Backend
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload --port 8000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 🚀 Deployment Guide

### Deploying to Google Cloud Run

```bash
# Build & push Docker image
gcloud builds submit --tag gcr.io/$PROJECT_ID/scotoma

# Deploy container
gcloud run deploy scotoma \
  --image gcr.io/$PROJECT_ID/scotoma \
  --platform managed \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY,GEMINI_MODEL=gemini-2.5-flash \
  --allow-unauthenticated
```

### Deploying to Render

1. Create a new **Web Service** on Render connected to this repository.
2. Select environment: **Docker** (Render uses the root `Dockerfile` automatically).
3. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API Key
   - `GEMINI_MODEL`: `gemini-2.5-flash`

---

## 📁 Built-in Demo Scenarios

Three pre-filled demo scenarios exist in `scenarios/` for quick evaluation:
1. `scenarios/internship.json` — High-Stipend Internship vs Software Developer Job
2. `scenarios/relocation.json` — Relocating to London for High Pay vs Staying Local
3. `scenarios/quit_job.json` — Leaving Stable MNC to Join Early-Stage Startup

---

## 📝 Submission Text

> SCOTOMA helps people see what they can't see in their own reasoning. Gemini turns a decision into structured claims; a Z3 theorem prover then proves contradictions and tests which assumptions the decision depends on; a quote-anchored verifier guarantees every blind spot is grounded in the user's words. It never decides for the user. Stack: React + TypeScript, FastAPI, Z3, OGL (WebGL), Gemini.

---

## 🧪 Running Tests

```bash
# Backend pytest
pytest

# Frontend vitest
cd frontend && npm test
```

---

## 🛡️ License

MIT License
