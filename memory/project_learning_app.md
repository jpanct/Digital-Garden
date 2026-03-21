---
name: Digital Garden Learning App
description: Full-stack AI-powered learning plan app with RAG resources, notes, quizzes, and garden visualization
type: project
---

Built a full-stack learning application at `/Users/jamiepan/Documents/DigitalGarden/learning-app/`.

**Why:** User wanted an app where they enter a skill, get assessed by AI, receive a personalized learning plan with real (non-AI-generated) resources via RAG, take notes, track progress, take quizzes, and see a plant grow in a garden as they progress.

**Stack:**
- Backend: FastAPI + SQLite + SQLAlchemy at `backend/` — run with `python run.py`
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS at `frontend/` — run with `npm run dev`
- AI: Claude API (claude-sonnet-4-6) via `anthropic` SDK
- RAG: Tavily Search API for finding real, non-AI-generated resources

**Keys needed:** ANTHROPIC_API_KEY and TAVILY_API_KEY in `backend/.env`

**Garden stages:** Seed (0-9%) → Sprout (10-29%) → Sapling (30-59%) → Blooming (60-89%) → Full Tree (90-100%)

**How to apply:** When user asks about this app, refer to this structure. The user plans to extend the garden feature further.
