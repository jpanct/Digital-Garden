from __future__ import annotations
import asyncio
from urllib.parse import urlparse
from tavily import TavilyClient
from app.config import settings


def _get_domain(url: str) -> str:
    """Extract the netloc (e.g. 'www.youtube.com') from a URL."""
    try:
        return urlparse(url).netloc.lower()
    except Exception:
        return ""


def _classify_resource(url: str) -> str:
    """Classify a URL into a resource type."""
    domain = _get_domain(url)
    if "youtube.com" in domain or "youtu.be" in domain:
        return "video"
    if "github.com" in domain or "gitlab.com" in domain:
        return "github"
    if any(
        d in domain
        for d in [
            "coursera.org",
            "udemy.com",
            "edx.org",
            "pluralsight.com",
            "linkedin.com",
        ]
    ):
        return "course"
    if any(
        d in domain
        for d in [
            "amazon.com",
            "goodreads.com",
            "oreilly.com",
            "manning.com",
        ]
    ):
        return "book"
    return "article"


def _friendly_source(domain: str) -> str:
    """Convert a domain to a friendly display name."""
    mapping = {
        "youtube.com": "YouTube",
        "youtu.be": "YouTube",
        "github.com": "GitHub",
        "gitlab.com": "GitLab",
        "coursera.org": "Coursera",
        "udemy.com": "Udemy",
        "edx.org": "edX",
        "pluralsight.com": "Pluralsight",
        "linkedin.com": "LinkedIn Learning",
        "amazon.com": "Amazon",
        "goodreads.com": "Goodreads",
        "oreilly.com": "O'Reilly",
        "manning.com": "Manning",
        "developer.mozilla.org": "MDN Web Docs",
        "stackoverflow.com": "Stack Overflow",
        "medium.com": "Medium",
        "dev.to": "DEV Community",
        "freecodecamp.org": "freeCodeCamp",
        "w3schools.com": "W3Schools",
        "geeksforgeeks.org": "GeeksforGeeks",
    }
    # Try exact match first (strip www.)
    clean = domain.lstrip("www.")
    for key, val in mapping.items():
        if key in clean:
            return val
    # Fall back to capitalised domain root
    parts = clean.split(".")
    return parts[0].capitalize() if parts else domain


def _authority_bonus(domain: str) -> float:
    """Return a relevance score bonus based on the domain authority."""
    if "youtube.com" in domain or "youtu.be" in domain:
        return 0.15
    if "github.com" in domain:
        return 0.12
    if "coursera.org" in domain:
        return 0.12
    if domain.startswith("docs."):
        return 0.20
    if "developer.mozilla.org" in domain:
        return 0.20
    return 0.0


def _run_search(client: TavilyClient, query: str, max_results: int) -> list[dict]:
    """Synchronous Tavily search call (runs in executor)."""
    try:
        response = client.search(query=query, max_results=max_results)
        return response.get("results", [])
    except Exception:
        return []


async def fetch_resources_for_module(
    skill: str,
    module_title: str,
    module_description: str,
    level: str,
) -> list[dict]:
    """
    Run parallel Tavily searches, classify, deduplicate, score and return
    the top 10 resources for a learning module.
    """
    tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

    queries = [
        f"{skill} {module_title} tutorial beginner guide",
        f"{skill} {module_title} {level} course",
        f"best {skill} {module_title} resources",
        f"{skill} {module_title} github examples project",
    ]

    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(None, _run_search, tavily, query, 4)
        for query in queries
    ]
    results_per_query: list[list[dict]] = await asyncio.gather(*tasks)

    # Flatten and deduplicate by URL
    seen_urls: dict[str, dict] = {}
    domain_counts: dict[str, int] = {}

    for results in results_per_query:
        for item in results:
            url: str = item.get("url", "")
            if not url or url in seen_urls:
                continue

            domain = _get_domain(url)
            # Cap at 2 results per domain
            if domain_counts.get(domain, 0) >= 2:
                continue

            resource_type = _classify_resource(url)
            source = _friendly_source(domain)
            raw_score: float = float(item.get("score", 0.5))
            bonus = _authority_bonus(domain)
            relevance_score = min(raw_score + bonus, 1.0)

            seen_urls[url] = {
                "title": item.get("title", "Untitled"),
                "url": url,
                "resource_type": resource_type,
                "source": source,
                "description": item.get("content", "")[:500],
                "relevance_score": relevance_score,
            }
            domain_counts[domain] = domain_counts.get(domain, 0) + 1

    # Sort by relevance and return top 10
    sorted_resources = sorted(
        seen_urls.values(),
        key=lambda r: r["relevance_score"],
        reverse=True,
    )
    return sorted_resources[:10]
