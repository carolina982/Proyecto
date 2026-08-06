#!/usr/bin/env bash
# Configura un túnel Cloudflare con hostname fijo (voltabs.mx).
# Requiere: cloudflared instalado y dominio voltabs.mx en la misma cuenta Cloudflare.
set -euo pipefail

NAME="${1:-volta}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CFG_DIR="$ROOT/deploy/cloudflared"
EXAMPLE="$CFG_DIR/config.yml.example"
CFG="$CFG_DIR/config.yml"

echo "==> Login Cloudflare (abre el navegador si hace falta)"
cloudflared tunnel login

echo "==> Crear túnel nombrado: $NAME (si ya existe, se reutiliza)"
if ! cloudflared tunnel list 2>/dev/null | grep -q " $NAME "; then
  cloudflared tunnel create "$NAME"
fi

TUNNEL_ID="$(cloudflared tunnel list | awk -v n="$NAME" '$2==n {print $1; exit}')"
if [[ -z "${TUNNEL_ID:-}" ]]; then
  echo "No se pudo obtener el ID del túnel $NAME"
  exit 1
fi

CRED="$HOME/.cloudflared/${TUNNEL_ID}.json"
if [[ ! -f "$CRED" ]]; then
  echo "Falta el archivo de credenciales: $CRED"
  exit 1
fi

sed "s/<TUNNEL_ID>/${TUNNEL_ID}/g" "$EXAMPLE" > "$CFG"
echo "Config escrita en $CFG"

echo "==> Enlazar DNS (CNAME permanente en Cloudflare)"
cloudflared tunnel route dns "$NAME" voltabs.mx || true
cloudflared tunnel route dns "$NAME" www.voltabs.mx || true

echo ""
echo "Listo. Arranca el túnel estable con:"
echo "  pm2 delete volta-tunnel 2>/dev/null || true"
echo "  pm2 start \"cloudflared tunnel --config $CFG run\" --name volta-tunnel"
echo "  pm2 save"
echo ""
echo "NO uses: cloudflared tunnel --url http://localhost:3000"
echo "Eso genera URLs *.trycloudflare.com que cambian al reiniciar."
