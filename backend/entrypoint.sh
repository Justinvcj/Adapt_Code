#!/usr/bin/env sh
# Boot sequence for the Cloud Run container:
#   1. Start tailscaled in userspace-networking mode (no TUN device available).
#   2. Join the tailnet with the auth key from env.
#   3. Launch uvicorn.
#
# tailscaled uses an in-container SOCKS5/HTTP proxy so our Python code can
# reach 100.x tailnet addresses without root. httpx and the Piston service
# transparently pick up ALL_PROXY=socks5h://localhost:1055 and
# HTTPS_PROXY=http://localhost:1055 — set here before uvicorn starts.
set -eu

: "${TS_AUTHKEY:?TS_AUTHKEY env var is required to join the tailnet}"
: "${TS_HOSTNAME:=adaptcode-backend}"

mkdir -p "$TS_STATE_DIR" /var/run/tailscale

echo "[boot] starting tailscaled (userspace-networking)"
tailscaled \
  --state="$TS_STATE_DIR/tailscaled.state" \
  --socket="$TS_SOCKET" \
  --tun=userspace-networking \
  --socks5-server=localhost:1055 \
  --outbound-http-proxy-listen=localhost:1055 \
  > /tmp/tailscaled.log 2>&1 &

TSD_PID=$!

# Wait for tailscaled to open its socket.
tries=0
while [ ! -S "$TS_SOCKET" ] && [ "$tries" -lt 30 ]; do
  sleep 0.2
  tries=$((tries + 1))
done

echo "[boot] joining tailnet as $TS_HOSTNAME"
tailscale --socket="$TS_SOCKET" up \
  --authkey="$TS_AUTHKEY" \
  --hostname="$TS_HOSTNAME" \
  --accept-dns=false \
  --accept-routes

echo "[boot] tailscale status:"
tailscale --socket="$TS_SOCKET" status | head -5 || true

# Route httpx / requests through the local tailscale proxy so Piston calls
# use the tailnet address.
export ALL_PROXY="socks5h://localhost:1055"
export HTTPS_PROXY="http://localhost:1055"
export HTTP_PROXY="http://localhost:1055"
export NO_PROXY="localhost,127.0.0.1,$(hostname),.supabase.co,.googleapis.com,.google.com"

echo "[boot] starting uvicorn on :$PORT"
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --proxy-headers --forwarded-allow-ips="*"
