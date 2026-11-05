#!/usr/bin/env bash
# Smoke test : l'application répond-elle, et est-ce bien la bonne version ?
# Usage : ./smoke.sh URL VERSION_ATTENDUE [TENTATIVES]
set -u
URL="${1:?usage: smoke.sh URL VERSION_ATTENDUE [TENTATIVES]}"
EXPECTED="${2:?version attendue manquante}"
TRIES="${3:-15}"

for i in $(seq 1 "$TRIES"); do
  if curl -fsS "$URL/health" >/dev/null 2>&1; then
    got="$(curl -fsS "$URL/version" | sed -E 's/.*"version":"([^"]*)".*/\1/')"
    if [ "$got" = "$EXPECTED" ]; then
      echo "OK : $URL répond, version $got"
      exit 0
    fi
    echo "ECHEC : version $got au lieu de $EXPECTED"
    exit 1
  fi
  echo "tentative $i/$TRIES : pas encore prêt…"
  sleep 2
done
echo "ECHEC : $URL ne répond pas après $TRIES tentatives"
exit 1
