"""Pathumma LLM client (AI FOR THAI / NECTEC), same integration pattern used
in the Brain-Sole project: POST api.aiforthai.in.th/textqa/completion with
an Apikey header.

Requires the AIFORTHAI_APIKEY environment variable — register for a free
key at https://aiforthai.in.th. Until then, calls raise LLMNotConfiguredError
so the API can respond with a clear, honest error instead of a fake reply.
"""

import os

import httpx

PATHUMMA_URL = "https://api.aiforthai.in.th/textqa/completion"


class LLMNotConfiguredError(Exception):
    pass


class LLMRequestError(Exception):
    pass


def call_pathumma(
    instruction: str,
    system_prompt: str,
    max_new_tokens: int = 512,
    temperature: float = 0.3,
) -> str:
    api_key = os.environ.get("AIFORTHAI_APIKEY")
    if not api_key:
        raise LLMNotConfiguredError(
            "AIFORTHAI_APIKEY is not set. Register for a free key at "
            "https://aiforthai.in.th and set it as an environment variable "
            "before starting the API."
        )

    try:
        resp = httpx.post(
            PATHUMMA_URL,
            headers={"Apikey": api_key},
            json={
                "instruction": instruction,
                "system_prompt": system_prompt,
                "max_new_tokens": max_new_tokens,
                "temperature": temperature,
                "return_json": True,
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        return resp.json()["content"]
    except httpx.HTTPError as e:
        raise LLMRequestError(f"Pathumma API request failed: {e}") from e
    except (KeyError, ValueError) as e:
        raise LLMRequestError(f"Unexpected Pathumma API response: {e}") from e
