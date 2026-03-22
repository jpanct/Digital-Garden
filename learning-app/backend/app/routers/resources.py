from __future__ import annotations
import json
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.learning_plan import LearningPlan
from app.models.resource import Resource
from app.services import rag_service
from app.services import claude_service

router = APIRouter()

CACHE_TTL_DAYS = 7


class MediaRequest(BaseModel):
    streaming_services: List[str]


@router.get("/plans/{plan_id}/modules/{module_id}/resources")
async def get_module_resources(
    plan_id: int,
    module_id: str,
    db: Session = Depends(get_db),
):
    plan = db.get(LearningPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    # Check DB cache
    cache_cutoff = datetime.utcnow() - timedelta(days=CACHE_TTL_DAYS)
    cached = (
        db.query(Resource)
        .filter(
            Resource.plan_id == plan_id,
            Resource.module_id == module_id,
            Resource.fetched_at >= cache_cutoff,
        )
        .all()
    )

    if cached:
        return {
            "cached": True,
            "resources": [
                {
                    "id": r.id,
                    "title": r.title,
                    "url": r.url,
                    "resource_type": r.resource_type,
                    "source": r.source,
                    "description": r.description,
                    "relevance_score": r.relevance_score,
                    "fetched_at": r.fetched_at,
                }
                for r in cached
            ],
        }

    # Find the module in plan_json to get its title/description
    plan_data = json.loads(plan.plan_json)
    module_info = next(
        (m for m in plan_data.get("modules", []) if m.get("id") == module_id),
        None,
    )
    if not module_info:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found in plan.")

    module_title = module_info.get("title", "")
    module_description = module_info.get("description", "")

    # Run RAG pipeline
    try:
        results = await rag_service.fetch_resources_for_module(
            skill=plan.skill,
            module_title=module_title,
            module_description=module_description,
            level=plan.level_assessed or "beginner",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Resource fetch error: {str(e)}")

    # Persist to DB
    saved_resources = []
    for item in results:
        resource = Resource(
            plan_id=plan_id,
            module_id=module_id,
            resource_type=item["resource_type"],
            title=item["title"],
            url=item["url"],
            source=item["source"],
            description=item.get("description", ""),
            relevance_score=item.get("relevance_score", 0.0),
        )
        db.add(resource)
        db.flush()
        saved_resources.append(resource)

    db.commit()

    return {
        "cached": False,
        "resources": [
            {
                "id": r.id,
                "title": r.title,
                "url": r.url,
                "resource_type": r.resource_type,
                "source": r.source,
                "description": r.description,
                "relevance_score": r.relevance_score,
                "fetched_at": r.fetched_at,
            }
            for r in saved_resources
        ],
    }


@router.post("/plans/{plan_id}/modules/{module_id}/media")
def get_media_recommendations(
    plan_id: int,
    module_id: str,
    body: MediaRequest,
    db: Session = Depends(get_db),
):
    plan = db.get(LearningPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    plan_data = json.loads(plan.plan_json)
    module_info = next(
        (m for m in plan_data.get("modules", []) if m.get("id") == module_id),
        None,
    )
    if not module_info:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found.")

    try:
        result = claude_service.recommend_documentaries(
            skill=plan.skill,
            module_title=module_info.get("title", ""),
            level=plan.level_assessed or "beginner",
            streaming_services=body.streaming_services,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Media recommendation error: {str(e)}")

    return result
