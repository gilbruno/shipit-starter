# deploy/ — kit de la séance 4

- `smoke.sh` : smoke test (santé + version attendue).
- `Dockerfile.broken` : fabrique une image volontairement cassée (pour le rollback).
- `staging/compose.yml` : démarre l'image publiée.
- `bluegreen/` : deux versions + Nginx, `switch.sh blue|green` pour basculer.
- `canary/` : version stable + canary pondérés 9:1 par Nginx, `observe.sh` pour compter.

Images attendues en local : `shipit:1.0.0` et `shipit:1.1.0`
(`docker build --build-arg APP_VERSION=1.0.0 -t shipit:1.0.0 .`), ou vos images GHCR via les variables
`BLUE_IMAGE`, `GREEN_IMAGE`, `STABLE_IMAGE`, `CANARY_IMAGE`.
