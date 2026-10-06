# Backend container: FastAPI + Tailscale (userspace) in one image.
# Tailscale runs alongside uvicorn so the Cloud Run service can reach the
# private AWS Piston sandbox at 100.114.155.33:2000 over the tailnet.
#
# Required runtime env vars (set in Cloud Run service config):
#   SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY, GEMINI_API_KEY,
#   PISTON_URL=http://100.114.155.33:2000,
#   FRONTEND_URL=https://<your>.vercel.app[,https://<other>.vercel.app],
#   TS_AUTHKEY=tskey-auth-...  (ephemeral + non-reusable, from the Tailscale admin console)
#   TS_HOSTNAME=adaptcode-backend
#   ENV=production
#   PORT=8080  (Cloud Run sets this automatically)
#   TRUSTED_PROXY_CIDRS=35.191.0.0/16,130.211.0.0/22  (Google Cloud LB egress)

FROM python:3.11-slim AS runtime

WORKDIR /srv

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TS_STATE_DIR=/var/lib/tailscale \
    TS_SOCKET=/var/run/tailscale/tailscaled.sock

# System deps + tailscale from the official APT repo.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg iptables gcc libpq-dev \
 && curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.noarmor.gpg \
      -o /usr/share/keyrings/tailscale-archive-keyring.gpg \
 && curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.tailscale-keyring.list \
      -o /etc/apt/sources.list.d/tailscale.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends tailscale \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p "$TS_STATE_DIR" /var/run/tailscale

# Python deps.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code.
COPY app ./app
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x /srv/entrypoint.sh

# Cloud Run listens on $PORT (default 8080).
ENV PORT=8080
EXPOSE 8080

CMD ["/srv/entrypoint.sh"]
