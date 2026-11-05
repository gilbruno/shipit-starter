import { defineConfig } from "vitest/config";

// Tests d'intégration (PostgreSQL requis) : introduits en séance 2.
export default defineConfig({
  test: { include: ["test/**/*.integration.test.ts"] },
});
