# Digital Garden [IN PROGRESS]
**Learn anything with structure—not another wall of AI slop.**
## The problem
A lot of learners have tried “just ask the chatbot” and bounced off. The model answers feel **generic**, **unbounded**, and **hard to trust**: long essays, no real diagnosis of where you are, no clear next steps, and no sense of progress. That is not a learning system—it is **AI slop**: cheap volume instead of a plan you can actually follow.
People do not want more text. They want **clarity** (what level am I at?), **sequence** (what do I do in what order?), **proof of progress** (did I move forward?), and **curated support** (resources and practice that match the path—not a random reading list).
## What Digital Garden does
Digital Garden uses AI **as a means to an end**: a **short conversational assessment**, then a **concrete learning plan** (modules and milestones), **suggested resources**, and lightweight study tools (**notes**, **quizzes**). Progress is visualized as a **garden that grows** with completed milestones—so the experience rewards finishing steps, not scrolling through replies.
In short: **assess → plan → act → track**—with the model doing the heavy lifting on structure and personalization, and the app holding the state so you are not stuck in an endless chat thread.
## Features
- **Skill-first onboarding** — Name yourself, pick any skill, start.
- **Guided assessment** — Chat-style Q&A to gauge level before planning.
- **Structured plan** — Modules, milestones, and timeline-style framing.
- **Per-module workspace** — Resources, rich-text notes, quizzes.
- **Optional media angles** — Documentary-style suggestions with streaming-service filters.
- **Garden progress** — Stages that reflect real milestone completion (not vibes).
## Tech stack
| Layer    | Stack |
|----------|--------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Zustand, TipTap, React Router |
| Backend  | FastAPI, SQLAlchemy, SQLite (default), Claude (Anthropic), Tavily (search/RAG-related flows) |
## Prerequisites
- **Node.js** (for the frontend)
- **Python 3** with dependencies from the backend (see below)
- **Anthropic API key** (required for assessment, planning, and related AI features)
- **Tavily API key** (used where the backend integrates search/RAG-style retrieval)
## Setup
### Backend
```bash
cd learning-app/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
Create a .env in learning-app/backend (see Configuration), then run:

python run.py
The API serves on http://localhost:8000 (with reload enabled via run.py).

Frontend
cd learning-app/frontend
npm install
npm run dev
The app runs on http://localhost:5173. Vite proxies /api to the backend on port 8000.

Configuration
Environment variables (backend .env):

Variable	Purpose
ANTHROPIC_API_KEY	Claude API access
TAVILY_API_KEY	Search / retrieval used by resource-related features
DATABASE_URL	Defaults to sqlite:///./digital_garden.db
FRONTEND_URL	CORS; default http://localhost:5173
CLAUDE_MODEL	Model id (default in code: claude-sonnet-4-6)
Scripts
Frontend

npm run dev — dev server
npm run build — production build
npm run preview — preview production build
Backend

python run.py — run API with uvicorn reload
Philosophy
AI is useful when it commits to outcomes: a level call, a plan, checkboxes, and stored progress. Digital Garden is aimed at learners who are done with slop and want something that behaves more like a learning product than a chat window.

License
MIT License

Copyright (c) [2026] [Jamie Pan]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
