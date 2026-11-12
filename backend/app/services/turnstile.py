"""Cloudflare Turnstile verification.

Feature-flagged on the `TURNSTILE_SECRET_KEY` env var. When unset, every
verification call is a no-op that returns True, so deploying this service
without the key does not change the signup flow. Enable later by:

  1. Create a Turnstile widget at https://dash.cloudflare.com/?to=/:account/turnstile
  2. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY (public) in Vercel
  3. Set TURNSTILE_SECRET_KEY (secret) on Cloud Run

Verification fails CLOSED on Cloudflare API errors: an attacker cannot DoS
Cloudflare to bypass the gate. Signups during a real Cloudflare outage can be
restored by temporarily unsetting the secret.

The verify endpoint is a public internet host and MUST be in NO_PROXY in
backend/entrypoint.sh, otherwise the Tailscale proxy traps the outbound
HTTPS. (See .cloudflare.com in the NO_PROXY list.)
"""

from __future__ import annotations

import os
from typing import Optional

import httpx

from app.core.logging import logger

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def is_enabled() -> bool:
    return bool(os.environ.get("TURNSTILE_SECRET_KEY"))


async def verify_turnstile(token: Optional[str], remote_ip: Optional[str] = None) -> bool:
    if not is_enabled():
        return True
    if not token:
        return False

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            payload = {
                "secret": os.environ["TURNSTILE_SECRET_KEY"],
                "response": token,
            }
            if remote_ip:
                payload["remoteip"] = remote_ip
            resp = await client.post(TURNSTILE_VERIFY_URL, data=payload)
    except Exception as e:
        logger.warning("turnstile verify request failed: %s", type(e).__name__)
        return False

    if resp.status_code != 200:
        logger.warning("turnstile verify returned HTTP %d", resp.status_code)
        return False

    try:
        data = resp.json()
    except ValueError:
        logger.warning("turnstile verify returned non-JSON body")
        return False

    success = bool(data.get("success"))
    if not success:
        logger.info("turnstile verify rejected: %s", data.get("error-codes"))
    return success
