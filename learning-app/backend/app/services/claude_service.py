from __future__ import annotations
import json
import re
from typing import Optional
import anthropic
from app.config import settings


client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _extract_json(text: str) -> Optional[dict]:
    """Try to parse JSON from a response string, handling code fences."""
    # Strip markdown code fences if present
    cleaned = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
    # Try to find a JSON object in the text
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None


def start_assessment(skill: str) -> str:
    """Returns the first assessment question from Claude."""
    system_prompt = (
        f"You are an expert educator assessing someone's knowledge level in {skill}. "
        "Ask 5-7 progressively adaptive questions to determine their level "
        "(beginner, intermediate, or advanced). Start with a broad foundational question. "
        "Questions must be conversational, not quiz-like. After gathering enough info, "
        'respond ONLY with JSON: {"assessment_complete": true, "level": "beginner|intermediate|advanced", '
        '"rationale": "..."} Output raw JSON only when done, never more than 7 questions.'
    )

    response = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=500,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Please assess my knowledge level in {skill}. Start with your first question.",
            }
        ],
    )
    return response.content[0].text


def continue_assessment(skill: str, messages: list[dict]) -> dict:
    """
    Sends the full conversation history to Claude and returns either
    {"done": False, "content": "next question"} or
    {"done": True, "level": "...", "rationale": "..."}.
    """
    system_prompt = (
        f"You are an expert educator assessing someone's knowledge level in {skill}. "
        "Ask 5-7 progressively adaptive questions to determine their level "
        "(beginner, intermediate, or advanced). Start with a broad foundational question. "
        "Questions must be conversational, not quiz-like. After gathering enough info, "
        'respond ONLY with JSON: {"assessment_complete": true, "level": "beginner|intermediate|advanced", '
        '"rationale": "..."} Output raw JSON only when done, never more than 7 questions.'
    )

    response = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=600,
        system=system_prompt,
        messages=messages,
    )

    content = response.content[0].text.strip()
    parsed = _extract_json(content)

    if parsed and parsed.get("assessment_complete"):
        return {
            "done": True,
            "level": parsed.get("level", "beginner"),
            "rationale": parsed.get("rationale", ""),
        }

    return {"done": False, "content": content}


def generate_plan(skill: str, level: str, assessment_summary: str) -> dict:
    """
    Generates a structured learning plan for the given skill and level.
    Returns a parsed dict with title, description, estimated_weeks, and modules.
    """
    system_prompt = (
        "You are an expert curriculum designer. Generate a detailed, structured learning plan. "
        "Respond ONLY with valid JSON — no prose, no markdown fences. "
        "The JSON must follow this exact structure:\n"
        "{\n"
        '  "title": "string",\n'
        '  "description": "string",\n'
        '  "estimated_weeks": integer,\n'
        '  "modules": [\n'
        "    {\n"
        '      "id": "mod_1",\n'
        '      "title": "string",\n'
        '      "order": 1,\n'
        '      "description": "string",\n'
        '      "estimated_days": integer,\n'
        '      "milestones": [\n'
        '        {"id": "ms_1_1", "text": "string", "completed": false}\n'
        "      ]\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "Requirements: 4-8 modules, 3-6 milestones per module. "
        "Module ids must be mod_1, mod_2, etc. "
        "Milestone ids must be ms_<module_number>_<milestone_number> (e.g. ms_1_1, ms_1_2)."
    )

    user_message = (
        f"Create a comprehensive learning plan for: {skill}\n"
        f"Student level: {level}\n"
        f"Assessment summary: {assessment_summary}\n\n"
        "Generate the full learning plan as JSON now."
    )

    response = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=4096,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    content = response.content[0].text.strip()
    parsed = _extract_json(content)
    if parsed is None:
        raise ValueError(f"Claude did not return valid JSON for the plan. Raw response: {content[:300]}")
    return parsed


def generate_quiz(
    skill: str,
    module_title: str,
    module_description: str,
    level: str,
) -> dict:
    """
    Generates a quiz for a specific module.
    Returns parsed dict: {"questions": [...]}
    """
    system_prompt = (
        "You are an expert educator creating a quiz. "
        "Respond ONLY with valid JSON — no prose, no markdown fences. "
        "The JSON must follow this exact structure:\n"
        "{\n"
        '  "questions": [\n'
        "    {\n"
        '      "id": "q_1",\n'
        '      "question": "string",\n'
        '      "options": ["option A", "option B", "option C", "option D"],\n'
        '      "correct_index": 0,\n'
        '      "explanation": "string"\n'
        "    }\n"
        "  ]\n"
        "}\n"
        "Requirements: 5-8 questions, exactly 4 options each, "
        "correct_index is 0-based integer, clear explanations."
    )

    user_message = (
        f"Create a quiz for the following module:\n"
        f"Skill: {skill}\n"
        f"Module: {module_title}\n"
        f"Description: {module_description}\n"
        f"Student level: {level}\n\n"
        "Generate the quiz as JSON now."
    )

    response = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=2048,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    content = response.content[0].text.strip()
    parsed = _extract_json(content)
    if parsed is None:
        raise ValueError(f"Claude did not return valid JSON for the quiz. Raw response: {content[:300]}")
    return parsed
