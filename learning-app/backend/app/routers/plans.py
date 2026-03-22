from __future__ import annotations
import json
from datetime import datetime
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.learning_plan import LearningPlan
from app.models.resource import Resource
from app.models.note import Note
from app.models.quiz import Quiz
from app.services.garden_service import calculate_garden_stage
from app.services import claude_service

router = APIRouter()


class MilestoneUpdateRequest(BaseModel):
    completed: bool


class MilestoneUpdateResponse(BaseModel):
    plan_id: int
    milestone_id: str
    completed: bool
    completed_milestones: int
    total_milestones: int
    garden_stage: int
    progress_percentage: float


@router.get("/plans/{plan_id}")
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.get(LearningPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    plan_data = json.loads(plan.plan_json)
    return {
        "id": plan.id,
        "user_id": plan.user_id,
        "skill": plan.skill,
        "level_assessed": plan.level_assessed,
        "total_milestones": plan.total_milestones,
        "completed_milestones": plan.completed_milestones,
        "garden_stage": plan.garden_stage,
        "created_at": plan.created_at,
        "updated_at": plan.updated_at,
        "plan_data": plan_data,
    }


@router.patch("/plans/{plan_id}/milestones/{milestone_id}", response_model=MilestoneUpdateResponse)
def update_milestone(
    plan_id: int,
    milestone_id: str,
    body: MilestoneUpdateRequest,
    db: Session = Depends(get_db),
):
    plan = db.get(LearningPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    plan_data: dict = json.loads(plan.plan_json)
    found = False

    for module in plan_data.get("modules", []):
        for milestone in module.get("milestones", []):
            if milestone.get("id") == milestone_id:
                milestone["completed"] = body.completed
                found = True
                break
        if found:
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Milestone '{milestone_id}' not found in plan.")

    # Recount completed milestones
    completed_count = sum(
        1
        for mod in plan_data.get("modules", [])
        for ms in mod.get("milestones", [])
        if ms.get("completed")
    )

    total = plan.total_milestones
    garden_stage = calculate_garden_stage(completed_count, total)

    plan.plan_json = json.dumps(plan_data)
    plan.completed_milestones = completed_count
    plan.garden_stage = garden_stage
    plan.updated_at = datetime.utcnow()

    db.commit()

    progress_pct = round((completed_count / total * 100) if total > 0 else 0.0, 2)

    return MilestoneUpdateResponse(
        plan_id=plan_id,
        milestone_id=milestone_id,
        completed=body.completed,
        completed_milestones=completed_count,
        total_milestones=total,
        garden_stage=garden_stage,
        progress_percentage=progress_pct,
    )


@router.get("/plans/{plan_id}/progress")
def get_plan_progress(plan_id: int, db: Session = Depends(get_db)):
    plan = db.get(LearningPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    total = plan.total_milestones
    completed = plan.completed_milestones
    progress_pct = round((completed / total * 100) if total > 0 else 0.0, 2)

    plan_data = json.loads(plan.plan_json)
    module_progress = []
    for module in plan_data.get("modules", []):
        milestones = module.get("milestones", [])
        mod_total = len(milestones)
        mod_completed = sum(1 for ms in milestones if ms.get("completed"))
        module_progress.append(
            {
                "module_id": module.get("id"),
                "title": module.get("title"),
                "total": mod_total,
                "completed": mod_completed,
                "progress_percentage": round((mod_completed / mod_total * 100) if mod_total > 0 else 0.0, 2),
            }
        )

    return {
        "plan_id": plan_id,
        "skill": plan.skill,
        "level_assessed": plan.level_assessed,
        "total_milestones": total,
        "completed_milestones": completed,
        "progress_percentage": progress_pct,
        "garden_stage": plan.garden_stage,
        "module_progress": module_progress,
    }


@router.post("/plans/{plan_id}/regenerate")
def regenerate_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.get(LearningPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    # Generate a fresh plan from Claude
    try:
        plan_data = claude_service.generate_plan(
            plan.skill,
            plan.level_assessed or "beginner",
            f"Regenerating plan for {plan.skill} at {plan.level_assessed} level.",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Plan generation error: {str(e)}")

    total_milestones = sum(
        len(mod.get("milestones", []))
        for mod in plan_data.get("modules", [])
    )

    # Wipe associated resources, notes, and quizzes
    db.query(Resource).filter(Resource.plan_id == plan_id).delete()
    db.query(Note).filter(Note.plan_id == plan_id).delete()
    db.query(Quiz).filter(Quiz.plan_id == plan_id).delete()

    # Reset the plan
    plan.plan_json = json.dumps(plan_data)
    plan.total_milestones = total_milestones
    plan.completed_milestones = 0
    plan.garden_stage = 0
    plan.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(plan)

    return {
        "id": plan.id,
        "user_id": plan.user_id,
        "skill": plan.skill,
        "level_assessed": plan.level_assessed,
        "total_milestones": plan.total_milestones,
        "completed_milestones": plan.completed_milestones,
        "garden_stage": plan.garden_stage,
        "created_at": plan.created_at,
        "updated_at": plan.updated_at,
        "plan_data": plan_data,
    }
