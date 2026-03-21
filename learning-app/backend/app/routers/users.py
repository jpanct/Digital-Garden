from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.learning_plan import LearningPlan

router = APIRouter()


class CreateUserRequest(BaseModel):
    username: str


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


class PlanSummary(BaseModel):
    id: int
    skill: str
    level_assessed: Optional[str]
    total_milestones: int
    completed_milestones: int
    garden_stage: int
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/users", response_model=UserResponse)
def create_or_get_user(body: CreateUserRequest, db: Session = Depends(get_db)):
    username = body.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty.")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.get("/users/{user_id}/plans", response_model=List[PlanSummary])
def get_user_plans(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    plans = (
        db.query(LearningPlan)
        .filter(LearningPlan.user_id == user_id)
        .order_by(LearningPlan.created_at.desc())
        .all()
    )
    return plans
