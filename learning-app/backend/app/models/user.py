from __future__ import annotations
from datetime import datetime
from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    plans: Mapped[List["LearningPlan"]] = relationship(back_populates="user")
    notes: Mapped[List["Note"]] = relationship(back_populates="user")
    quiz_attempts: Mapped[List["QuizAttempt"]] = relationship(back_populates="user")
