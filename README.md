# shipit-starter

Dépôt de départ du fil rouge du cours **Intégration et Déploiement Continu** (ESGI 4).
Petite API de tâches (Node.js 24, TypeScript, Fastify, Vitest). **Aucun workflow CI : c'est votre travail.**

```bash
npm ci
npm test            # 5 tests unitaires, sans base de données
npm run lint
npm run build
npm run dev         # http://localhost:3000/health
```

Routes : `GET /health`, `GET /version`, `GET|POST /tasks`, `GET|PATCH|DELETE /tasks/:id`.

`npm run test:integration` (PostgreSQL requis) sera utilisé à partir de la séance 2.
`Dockerfile` volontairement naïf : il sera amélioré en séance 3.
