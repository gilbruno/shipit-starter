import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("/tasks", () => {
  it("crée une tâche", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { title: "Écrire le pipeline" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ title: "Écrire le pipeline", done: false });
  });

  it("liste les tâches créées", async () => {
    const app = buildApp();
    await app.inject({ method: "POST", url: "/tasks", payload: { title: "A" } });
    const res = await app.inject({ method: "GET", url: "/tasks" });
    expect(res.json()).toHaveLength(1);
  });

  it("refuse une tâche sans titre", async () => {
    const res = await buildApp().inject({ method: "POST", url: "/tasks", payload: {} });
    expect(res.statusCode).toBe(400);
  });
});
