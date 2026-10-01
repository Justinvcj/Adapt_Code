import ipaddress
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from app.core.config import settings

_TRUSTED_PROXIES = [ipaddress.ip_network(c.strip()) for c in settings.TRUSTED_PROXY_CIDRS.split(",") if c.strip()]

def get_real_ip(request: Request) -> str:
    peer = request.client.host if request.client else "0.0.0.0"
    try:
        peer_ip = ipaddress.ip_address(peer)
    except ValueError:
        return peer
    if any(peer_ip in net for net in _TRUSTED_PROXIES):
        fwd = request.headers.get("X-Forwarded-For")
        if fwd:
            return fwd.split(",")[-1].strip()
    return peer

limiter = Limiter(key_func=get_real_ip)

def setup_rate_limiting(app: FastAPI):
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
