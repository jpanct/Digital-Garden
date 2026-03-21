from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import create_tables
from app.routers import users, assessment, plans, resources, notes, quiz

app = FastAPI(
    title="Digital Garden Learning App API",
    description="Backend API for the Digital Garden learning app powered by Claude AI.",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(assessment.router, prefix="/api", tags=["Assessment"])
app.include_router(plans.router, prefix="/api", tags=["Plans"])
app.include_router(resources.router, prefix="/api", tags=["Resources"])
app.include_router(notes.router, prefix="/api", tags=["Notes"])
app.include_router(quiz.router, prefix="/api", tags=["Quiz"])


@app.on_event("startup")
def on_startup():
    create_tables()


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
