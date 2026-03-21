from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    skill: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(20), default="active")
    level_result: Mapped[Optional[str]] = mapped_column(String(50))
    plan_id: Mapped[Optional[int]] = mapped_column(ForeignKey("learning_plans.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    messages: Mapped[List["AssessmentMessage"]] = relationship(
        back_populates="session",
        order_by="AssessmentMessage.created_at",
    )


class AssessmentMessage(Base):
    __tablename__ = "assessment_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("assessment_sessions.id"))
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    session: Mapped["AssessmentSession"] = relationship(back_populates="messages")
