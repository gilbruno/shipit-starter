#!/usr/bin/env python3
"""Estime les métriques DORA d'un dépôt GitHub à partir de ses déploiements.

Usage : python3 dora.py COMPTE/DEPOT [ENVIRONNEMENT]      (défaut : production)
Prérequis : la CLI `gh` connectée (gh auth login) et Python 3.

C'est une ESTIMATION pédagogique : on lit les « deployments » créés par les jobs qui
déclarent `environment:`. Elle ne remplace pas un outil de mesure, et sur un historique
court (quelques déploiements) les chiffres sont peu significatifs : dites-le dans votre dossier.
"""
import json
import statistics
import subprocess
import sys
from datetime import datetime


def gh(path):
    out = subprocess.run(
        ["gh", "api", "--paginate", path], capture_output=True, text=True, check=True
    ).stdout
    # --paginate concatène des tableaux JSON : on les réunit
    decoder, idx, items = json.JSONDecoder(), 0, []
    out = out.strip()
    while idx < len(out):
        obj, end = decoder.raw_decode(out, idx)
        items.extend(obj if isinstance(obj, list) else [obj])
        idx = end
        while idx < len(out) and out[idx].isspace():
            idx += 1
    return items


def t(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def fmt(seconds):
    m = seconds / 60
    return f"{m:.1f} min" if m < 120 else f"{m / 60:.1f} h" if m < 2880 else f"{m / 1440:.1f} j"


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    repo = sys.argv[1]
    env = sys.argv[2] if len(sys.argv) > 2 else "production"

    deployments = sorted(
        gh(f"repos/{repo}/deployments?environment={env}&per_page=100"),
        key=lambda d: d["created_at"],
    )
    rows = []
    for d in deployments:
        statuses = gh(f"repos/{repo}/deployments/{d['id']}/statuses")
        final = sorted(statuses, key=lambda s: s["created_at"])[-1] if statuses else None
        state = final["state"] if final else "inconnu"
        commit = gh(f"repos/{repo}/commits/{d['sha']}")[0]
        authored = t(commit["commit"]["author"]["date"])
        end = t(final["created_at"]) if final else t(d["created_at"])
        rows.append({"sha": d["sha"][:7], "state": state, "end": end, "lead": (end - authored).total_seconds()})

    if not rows:
        sys.exit(f"Aucun déploiement trouvé pour l'environnement « {env} » dans {repo}.")

    ok = [r for r in rows if r["state"] == "success"]
    ko = [r for r in rows if r["state"] in ("failure", "error")]
    span_days = max((rows[-1]["end"] - rows[0]["end"]).total_seconds() / 86400, 1)

    print(f"Dépôt {repo} · environnement « {env} » · {len(rows)} déploiement(s)\n")
    if span_days < 7:
        print(f"Fréquence de déploiement : {len(ok)} réussi(s) sur {span_days:.0f} jour(s)"
              " (historique trop court pour une fréquence par semaine fiable)")
    else:
        print(f"Fréquence de déploiement : {len(ok)} réussi(s) sur {span_days:.0f} jour(s)"
              f" ≈ {len(ok) / span_days * 7:.1f} par semaine")
    if ok:
        print(f"Délai de mise en production (commit → déployé), médiane : {fmt(statistics.median(r['lead'] for r in ok))}")
    print(f"Taux d'échec des changements : {len(ko)}/{len(rows)} = {100 * len(ko) / len(rows):.0f} %")

    restores = []
    for bad in ko:
        later = [r for r in ok if r["end"] > bad["end"]]
        if later:
            restores.append((later[0]["end"] - bad["end"]).total_seconds())
    if restores:
        print(f"Temps de restauration après échec, médiane : {fmt(statistics.median(restores))}")
    else:
        print("Temps de restauration : non mesurable (aucun échec suivi d'un succès).")


if __name__ == "__main__":
    main()
