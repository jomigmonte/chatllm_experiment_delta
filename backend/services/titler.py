from __future__ import annotations

import re

import httpx

from backend.config import OPENROUTER_API_KEY, OPENROUTER_API_URL


class TitleGenerationError(RuntimeError):
    pass


def _build_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "ChatLLM Experiment",
    }


async def generate_title(first_user_message: str, max_attempts: int = 3) -> str:
    """Generate a short title (max 50 chars) from the first user message."""
    if not OPENROUTER_API_KEY:
        raise TitleGenerationError("OPENROUTER_API_KEY nao definido.")

    prompt = (
        "You are a title generator. Based on the user's first message below, "
        "generate a very short title (maximum 50 characters, ideally 3-5 words) "
        "that summarises the conversation topic. Reply with ONLY the title, no quotes, no extra text.\n\n"
        f"User message: {first_user_message[:500]}"
    )

    payload = {
        "model": "google/gemma-4-31b-it",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 30,
    }

    for attempt in range(max_attempts):
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                OPENROUTER_API_URL, json=payload, headers=_build_headers()
            )

        if response.status_code >= 400:
            if attempt < max_attempts - 1:
                continue
            raise TitleGenerationError(
                f"OpenRouter retornou erro {response.status_code} ao gerar titulo."
            )

        data = response.json()
        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        if content:
            # Clean and truncate
            clean = re.sub(r'^["\']+|["\']+$', "", content)
            clean = re.sub(r"\s+", " ", clean).strip()
            if len(clean) > 50:
                clean = clean[:50].rstrip()
            return clean or first_user_message[:50]

    return first_user_message[:50]