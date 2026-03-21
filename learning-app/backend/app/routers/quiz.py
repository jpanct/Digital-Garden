from __future__ import annotations
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.quiz import Quiz, QuizAttempt
from app.models.learning_plan import LearningPlan
from app.services import claude_service

router = APIRouter()


class AttemptRequest(BaseModel):
    user_id: int
    answers: Dict[str, int]  # {"q_1": 0, "q_2": 2}


class AttemptResult(BaseModel):
    question_id: str
    correct: bool
    correct_index: int
    explanation: str


class AttemptResponse(BaseModel):
    score: int
    total_questions: int
    correct_count: int
    results: List[AttemptResult]


def _get_module_info(plan: LearningPlan, module_id: str) -> dict:
    """Extract module title and description from plan_json."""
    plan_data = json.loads(plan.plan_json)
    module = next(
        (m for m in plan_data.get("modules", []) if m.get("id") == module_id),
        None,
    )
    if not module:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found in plan.")
    return module


def _get_or_404(db: Session, model, pk: int):
    obj = db.get(model, pk)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found.")
    return obj


def _quiz_to_response(quiz: Quiz, hide_answers: bool = True) -> dict:
    questions = json.loads(quiz.questions_json)
    if hide_answers:
        for q in questions:
            q.pop("correct_index", None)
            q.pop("explanation", None)
    return {
        "id": quiz.id,
        "plan_id": quiz.plan_id,
        "module_id": quiz.module_id,
        "created_at": quiz.created_at,
        "questions": questions,
    }


@router.post("/plans/{plan_id}/modules/{module_id}/quiz/generate")
def generate_quiz(plan_id: int, module_id: str, db: Session = Depends(get_db)):
    plan = _get_or_404(db, LearningPlan, plan_id)

    # Return existing quiz if one already exists
    existing = (
        db.query(Quiz)
        .filter(Quiz.plan_id == plan_id, Quiz.module_id == module_id)
        .first()
    )
    if existing:
        return _quiz_to_response(existing, hide_answers=False)

    module = _get_module_info(plan, module_id)

    try:
        quiz_data = claude_service.generate_quiz(
            skill=plan.skill,
            module_title=module["title"],
            module_description=module.get("description", ""),
            level=plan.level_assessed or "beginner",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Quiz generation error: {str(e)}")

    quiz = Quiz(
        plan_id=plan_id,
        module_id=module_id,
        questions_json=json.dumps(quiz_data.get("questions", [])),
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return _quiz_to_response(quiz, hide_answers=False)


@router.get("/plans/{plan_id}/modules/{module_id}/quiz")
def get_quiz(plan_id: int, module_id: str, db: Session = Depends(get_db)):
    _get_or_404(db, LearningPlan, plan_id)

    quiz = (
        db.query(Quiz)
        .filter(Quiz.plan_id == plan_id, Quiz.module_id == module_id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="No quiz found for this module. Generate one first.")

    return _quiz_to_response(quiz, hide_answers=True)


@router.post("/quiz/{quiz_id}/attempt", response_model=AttemptResponse)
def submit_attempt(quiz_id: int, body: AttemptRequest, db: Session = Depends(get_db)):
    quiz = _get_or_404(db, Quiz, quiz_id)
    questions: list[dict] = json.loads(quiz.questions_json)

    results = []
    correct_count = 0

    for q in questions:
        q_id: str = q["id"]
        correct_idx: int = q["correct_index"]
        selected = body.answers.get(q_id)

        is_correct = selected is not None and selected == correct_idx
        if is_correct:
            correct_count += 1

        results.append(
            AttemptResult(
                question_id=q_id,
                correct=is_correct,
                correct_index=correct_idx,
                explanation=q.get("explanation", ""),
            )
        )

    total = len(questions)
    score = round((correct_count / total * 100) if total > 0 else 0)

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=body.user_id,
        answers_json=json.dumps(body.answers),
        score=score,
    )
    db.add(attempt)
    db.commit()

    return AttemptResponse(
        score=score,
        total_questions=total,
        correct_count=correct_count,
        results=results,
    )


@router.get("/quiz/{quiz_id}/attempts/{user_id}")
def get_attempts(quiz_id: int, user_id: int, db: Session = Depends(get_db)):
    _get_or_404(db, Quiz, quiz_id)

    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.quiz_id == quiz_id, QuizAttempt.user_id == user_id)
        .order_by(QuizAttempt.completed_at.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "quiz_id": a.quiz_id,
            "user_id": a.user_id,
            "score": a.score,
            "answers": json.loads(a.answers_json),
            "completed_at": a.completed_at,
        }
        for a in attempts
    ]
