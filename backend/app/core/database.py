from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
from app.core.config import settings

# No-session options for service_role clients. supabase-py persists auth
# sessions across every client instance by default, so even a brand-new client
# picks up the last signed-in user and PostgREST runs its requests as
# `authenticated` instead of `service_role`. Disabling that keeps the client
# strictly service_role.
_NO_SESSION = ClientOptions(auto_refresh_token=False, persist_session=False)

_admin_client: Client | None = None

def get_supabase_admin() -> Client:
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _admin_client

def new_supabase_admin() -> Client:
    """Fresh service_role client whose identity won't drift to `authenticated`.
    Used for audit log writes etc. that must stay service_role regardless of
    what the shared admin client has signed into."""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_KEY,
        options=_NO_SESSION,
    )

def get_supabase_user(jwt: str) -> Client:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    client.postgrest.auth(jwt)
    return client

# Backwards-compat alias used by internal services (bkt, gemini) that run
# without a user JWT and need admin-level access.
get_supabase = get_supabase_admin
