#!/usr/bin/env bash
# Bascule le trafic vers « blue » ou « green » (sans couper le service).
# Usage : ./switch.sh blue|green
set -eu
case "${1:-}" in blue|green) ;; *) echo "usage: switch.sh blue|green" >&2; exit 2;; esac
echo "proxy_pass http://$1:3000;" > active.conf    # on réécrit le fichier sur place
docker compose exec proxy nginx -t
docker compose exec proxy nginx -s reload
echo "Trafic basculé vers $1"
