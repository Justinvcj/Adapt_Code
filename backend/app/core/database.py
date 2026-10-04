from supabase import create_client, Client
from app.core.config import settings

_admin_client: Client | None = None

def get_supabase_admin() -> Client:
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _admin_client

def get_supabase_user(jwt: str) -> Client:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    client.postgrest.auth(jwt)
    return client

# Backwards-compat alias used by internal services (bkt, gemini) that run
# without a user JWT and need admin-level access.
get_supabase = get_supabase_admin
