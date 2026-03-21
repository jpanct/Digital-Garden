from __future__ import annotations
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.note import Note
from app.models.learning_plan import LearningPlan

router = APIRouter()


class NoteCreateRequest(BaseModel):
    user_id: int
    content_html: str = ""
    content_text: str = ""


class NoteUpdateRequest(BaseModel):
    content_html: str = ""
    content_text: str = ""


class NoteResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    module_id: str
    content_html: str
    content_text: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/plans/{plan_id}/modules/{module_id}/notes", response_model=list[NoteResponse])
def get_notes(
    plan_id: int,
    module_id: str,
    user_id: int = Query(..., description="ID of the user whose notes to retrieve"),
    db: Session = Depends(get_db),
):
    plan = db.get(LearningPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    notes = (
        db.query(Note)
        .filter(
            Note.plan_id == plan_id,
            Note.module_id == module_id,
            Note.user_id == user_id,
        )
        .order_by(Note.created_at.asc())
        .all()
    )
    return notes


@router.post("/plans/{plan_id}/modules/{module_id}/notes", response_model=NoteResponse, status_code=201)
def create_note(
    plan_id: int,
    module_id: str,
    body: NoteCreateRequest,
    db: Session = Depends(get_db),
):
    plan = db.get(LearningPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    note = Note(
        user_id=body.user_id,
        plan_id=plan_id,
        module_id=module_id,
        content_html=body.content_html,
        content_text=body.content_text,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    body: NoteUpdateRequest,
    db: Session = Depends(get_db),
):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    note.content_html = body.content_html
    note.content_text = body.content_text
    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    return note


@router.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    db.delete(note)
    db.commit()
