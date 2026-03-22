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
    if any(
        d in domain
        for d in [
            "spotify.com",
            "podcasts.apple.com",
            "podcasts.google.com",
            "anchor.fm",
            "buzzsprout.com",
            "podbean.com",
            "overcast.fm",
            "pocketcasts.com",
            "stitcher.com",
            "iheart.com",
            "transistor.fm",
        ]
    ):
        return "podcast"
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



# Domains known to host quality educational content
QUALITY_DOMAINS = [
    "youtube.com", "youtu.be",
    "coursera.org", "udemy.com", "edx.org", "pluralsight.com",
    "khanacademy.org", "skillshare.com", "linkedin.com",
    "github.com", "gitlab.com",
    "developer.mozilla.org", "docs.python.org", "docs.microsoft.com",
    "freecodecamp.org", "w3schools.com", "geeksforgeeks.org",
    "medium.com", "dev.to", "hashnode.dev", "substack.com",
    "oreilly.com", "manning.com", "packtpub.com",
    "wikipedia.org", "britannica.com",
    "healthline.com", "webmd.com", "medicalnewstoday.com",
    "nytimes.com", "theguardian.com", "bbc.com", "bbc.co.uk",
    "sciencedaily.com", "nature.com", "sciencemag.org",
    "ted.com", "masterclass.com", "skillshare.com",
    "yoga.com", "yogajournal.com", "mindbodygreen.com", "verywellfit.com",
    "realpython.com", "css-tricks.com", "smashingmagazine.com",
    "tutorialspoint.com", "javatpoint.com",
]

# Keywords in the TITLE that suggest the content is primarily promotional/ad
_PROMO_TITLE_KEYWORDS = [
    "buy now", "% off", "discount", "promo code", "sponsored",
    "#ad", "| ad", "ad |", "free trial", "limited time offer",
    "click here", "sign up today", "get started today",
]

# Patterns that indicate a generic "list of resources" page rather than a specific resource
import re as _re
_LIST_PAGE_PATTERNS = [
    _re.compile(r'\b\d+\s+(best|top|free|great|must.?have)\b', _re.I),
    _re.compile(r'\b(best|top)\s+\d+\b', _re.I),
    _re.compile(r'\b\d+\s+(resources|tutorials|courses|sites|tools|ways|tips|books|videos)\b', _re.I),
    _re.compile(r'\b(best|top|ultimate|complete)\s+(list|collection|roundup|guide to finding)\b', _re.I),
]

# Domains to block entirely
_BLOCKED_DOMAINS = [
    "pinterest.com", "pinterest.co.uk",
    "quora.com",
    "reddit.com",  # threads are inconsistent quality for learning
    "yelp.com",
    "yellowpages.com",
    "tripadvisor.com",
    "etsy.com",
    "amazon.com",  # product pages, not learning
    "ebay.com",
    "twitter.com", "x.com",
    "facebook.com", "instagram.com", "tiktok.com",
]


def _is_promotional(title: str) -> bool:
    """Return True if the title looks like an ad or promotional content."""
    lower = title.lower()
    return any(kw in lower for kw in _PROMO_TITLE_KEYWORDS)


def _is_generic_list_page(title: str) -> bool:
    """Return True if the title is a generic 'N best resources' roundup page."""
    return any(p.search(title) for p in _LIST_PAGE_PATTERNS)


def _clean_description(text: str) -> str:
    """Strip markdown syntax and clean up Tavily content snippets."""
    # Remove markdown headings, links, images
    text = _re.sub(r'#{1,6}\s*', '', text)
    text = _re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text)
    text = _re.sub(r'!\[.*?\]\(.*?\)', '', text)
    # Remove bold/italic markers
    text = _re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', text)
    # Collapse whitespace
    text = _re.sub(r'\s+', ' ', text).strip()
    return text


def _run_search(client: TavilyClient, query: str, max_results: int) -> list[dict]:
    """Synchronous Tavily search call (runs in executor)."""
    try:
        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",
        )
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
    Run parallel Tavily searches, filter low-quality/promo results,
    classify, deduplicate, score and return the top 10 resources.
    """
    tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

    queries = [
        f"learn {skill} {module_title} {level} tutorial site:youtube.com OR site:coursera.org OR site:khanacademy.org",
        f"{skill} {module_title} {level} beginner guide tutorial",
        f"best free {skill} {module_title} course educational resource",
        f"{skill} {module_title} documentation examples practice",
        f"{skill} {module_title} podcast episode site:spotify.com OR site:podcasts.apple.com",
    ]

    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(None, _run_search, tavily, query, 5)
        for query in queries
    ]
    results_per_query: list[list[dict]] = await asyncio.gather(*tasks)

    seen_urls: dict[str, dict] = {}
    domain_counts: dict[str, int] = {}

    for results in results_per_query:
        for item in results:
            url: str = item.get("url", "")
            if not url or url in seen_urls:
                continue

            domain = _get_domain(url)

            # Block low-quality domains
            if any(blocked in domain for blocked in _BLOCKED_DOMAINS):
                continue

            # Cap at 2 results per domain
            if domain_counts.get(domain, 0) >= 2:
                continue

            title: str = item.get("title", "Untitled")
            content: str = item.get("content", "")

            # Skip promotional titles and generic list pages
            if _is_promotional(title) or _is_generic_list_page(title):
                continue

            resource_type = _classify_resource(url)
            source = _friendly_source(domain)
            raw_score: float = float(item.get("score", 0.5))
            bonus = _authority_bonus(domain)

            # Boost results from known quality educational domains
            quality_bonus = 0.1 if any(q in domain for q in QUALITY_DOMAINS) else 0.0
            relevance_score = min(raw_score + bonus + quality_bonus, 1.0)

            seen_urls[url] = {
                "title": title,
                "url": url,
                "resource_type": resource_type,
                "source": source,
                "description": _clean_description(content)[:400],
                "relevance_score": relevance_score,
            }
            domain_counts[domain] = domain_counts.get(domain, 0) + 1

    sorted_resources = sorted(
        seen_urls.values(),
        key=lambda r: r["relevance_score"],
        reverse=True,
    )
    return sorted_resources[:10]
