#!/usr/bin/env bash
# Envoie N requêtes et compte quelle version a répondu.
# Usage : ./observe.sh [N]
N="${1:-100}"
for _ in $(seq 1 "$N"); do curl -s localhost:8080/version; echo; done | sort | uniq -c
