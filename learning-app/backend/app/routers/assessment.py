from __future__ import annotations
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.assessment import AssessmentSession, AssessmentMessage
from app.models.learning_plan import LearningPlan
from app.services import claude_service
from app.services.garden_service import calculate_garden_stage

router = APIRouter()


class StartAssessmentRequest(BaseModel):
    skill: str
    user_id: int


class RespondRequest(BaseModel):
    session_id: int
    answer: str


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: int
    user_id: int
    skill: str
    status: str
    level_result: Optional[str]
    plan_id: Optional[int]
    created_at: datetime
    messages: List[MessageOut]

    class Config:
        from_attributes = True


@router.post("/assessment/start")
def start_assessment(body: StartAssessmentRequest, db: Session = Depends(get_db)):
    skill = body.skill.strip()
    if not skill:
        raise HTTPException(status_code=400, detail="Skill cannot be empty.")

    # Create a new assessment session
    session = AssessmentSession(user_id=body.user_id, skill=skill, status="active")
    db.add(session)
    db.flush()  # get session.id without committing

    # Call Claude for the first question
    try:
        first_message = claude_service.start_assessment(skill)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    # Save the assistant message
    msg = AssessmentMessage(
        session_id=session.id,
        role="assistant",
        content=first_message,
    )
    db.add(msg)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "message": first_message,
        "question_number": 1,
    }


@router.post("/assessment/respond")
def respond_to_assessment(body: RespondRequest, db: Session = Depends(get_db)):
    session = db.get(AssessmentSession, body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found.")
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment already completed.")

    # Save the user's answer
    user_msg = AssessmentMessage(
        session_id=session.id,
        role="user",
        content=body.answer.strip(),
    )
    db.add(user_msg)
    db.flush()

    # Build message history for Claude (assistant + user turns)
    db.refresh(session)
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in session.messages
    ]

    # Call Claude with full history
    try:
        result = claude_service.continue_assessment(session.skill, history)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    if result["done"]:
        level = result["level"]
        rationale = result.get("rationale", "")

        # Generate a learning plan
        try:
            plan_data = claude_service.generate_plan(session.skill, level, rationale)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=502, detail=f"Plan generation error: {str(e)}")

        # Count milestones
        total_milestones = sum(
            len(mod.get("milestones", []))
            for mod in plan_data.get("modules", [])
        )

        plan = LearningPlan(
            user_id=session.user_id,
            skill=session.skill,
            level_assessed=level,
            plan_json=json.dumps(plan_data),
            total_milestones=total_milestones,
            completed_milestones=0,
            garden_stage=0,
        )
        db.add(plan)
        db.flush()

        # Mark session as complete
        session.status = "completed"
        session.level_result = level
        session.plan_id = plan.id

        # Save completion message from Claude (rationale summary)
        completion_msg = AssessmentMessage(
            session_id=session.id,
            role="assistant",
            content=json.dumps({"assessment_complete": True, "level": level, "rationale": rationale}),
        )
        db.add(completion_msg)
        db.commit()

        return {
            "done": True,
            "level": level,
            "plan_id": plan.id,
        }

    # Assessment not yet complete — return next question
    next_question = result["content"]
    assistant_msg = AssessmentMessage(
        session_id=session.id,
        role="assistant",
        content=next_question,
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "done": False,
        "message": next_question,
    }


@router.get("/assessment/{session_id}", response_model=SessionOut)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.get(AssessmentSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found.")
    return session
