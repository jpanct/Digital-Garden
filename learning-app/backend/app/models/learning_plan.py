from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class LearningPlan(Base):
    __tablename__ = "learning_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    skill: Mapped[str] = mapped_column(String(200), nullable=False)
    level_assessed: Mapped[Optional[str]] = mapped_column(String(50))
    plan_json: Mapped[str] = mapped_column(Text)
    total_milestones: Mapped[int] = mapped_column(Integer, default=0)
    completed_milestones: Mapped[int] = mapped_column(Integer, default=0)
    garden_stage: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="plans")
    resources: Mapped[List["Resource"]] = relationship(back_populates="plan", cascade="all, delete-orphan")
    notes: Mapped[List["Note"]] = relationship(back_populates="plan", cascade="all, delete-orphan")
    quizzes: Mapped[List["Quiz"]] = relationship(back_populates="plan", cascade="all, delete-orphan")
