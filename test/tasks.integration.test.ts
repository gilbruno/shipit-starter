import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { PgTaskRepository } from "../src/pg-tasks.js";

// Nécessite PostgreSQL : DATABASE_URL=postgres://postgres:shipit@localhost:5432/shipit
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const repo = new PgTaskRepository(pool);

beforeAll(async () => {
  await repo.init();
});
beforeEach(async () => {
  await pool.query("TRUNCATE tasks");
});
afterAll(async () => {
  await pool.end();
});

describe("/tasks avec PostgreSQL", () => {
  it("persiste une tâche créée", async () => {
    const app = buildApp(repo);
    const created = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { title: "Persistée" },
    });
    expect(created.statusCode).toBe(201);
    const list = await app.inject({ method: "GET", url: "/tasks" });
    expect(list.json()).toEqual([
      expect.objectContaining({ title: "Persistée", done: false }),
    ]);
  });

  it("met à jour puis supprime une tâche", async () => {
    const app = buildApp(repo);
    const { id } = (
      await app.inject({ method: "POST", url: "/tasks", payload: { title: "T" } })
    ).json();
    const patched = await app.inject({
      method: "PATCH",
      url: `/tasks/${id}`,
      payload: { done: true },
    });
    expect(patched.json().done).toBe(true);
    expect((await app.inject({ method: "DELETE", url: `/tasks/${id}` })).statusCode).toBe(
      204,
    );
    expect((await app.inject({ method: "GET", url: `/tasks/${id}` })).statusCode).toBe(
      404,
    );
  });
});
