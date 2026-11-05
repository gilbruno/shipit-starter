import pg from "pg";
import type { Task, TaskRepository } from "./tasks.js";

/** Dépôt PostgreSQL : utilisé quand DATABASE_URL est défini (séance 2 : tests d'intégration). */
export class PgTaskRepository implements TaskRepository {
  constructor(private pool: pg.Pool) {}

  async init() {
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS tasks (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         title TEXT NOT NULL,
         done BOOLEAN NOT NULL DEFAULT false
       )`,
    );
  }
  async list() {
    return (
      await this.pool.query<Task>("SELECT id, title, done FROM tasks ORDER BY title")
    ).rows;
  }
  async get(id: string) {
    return (
      await this.pool.query<Task>("SELECT id, title, done FROM tasks WHERE id = $1", [id])
    ).rows[0];
  }
  async create(title: string) {
    const r = await this.pool.query<Task>(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, done",
      [title],
    );
    return r.rows[0];
  }
  async update(id: string, patch: { title?: string; done?: boolean }) {
    const r = await this.pool.query<Task>(
      `UPDATE tasks SET title = COALESCE($2, title), done = COALESCE($3, done)
       WHERE id = $1 RETURNING id, title, done`,
      [id, patch.title ?? null, patch.done ?? null],
    );
    return r.rows[0];
  }
  async remove(id: string) {
    const r = await this.pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }
}
