import Fastify from "fastify";
import { InMemoryTaskRepository, type TaskRepository } from "./tasks.js";

export const VERSION = process.env.APP_VERSION ?? "dev";

export function buildApp(repo: TaskRepository = new InMemoryTaskRepository()) {
  const app = Fastify();

  app.get("/health", async () => ({ status: "ok" }));
  app.get("/version", async () => ({ version: VERSION }));

  app.get("/tasks", async () => repo.list());

  app.post<{ Body: { title?: string } }>("/tasks", async (req, reply) => {
    const title = req.body?.title?.trim();
    if (!title) return reply.code(400).send({ error: "title requis" });
    return reply.code(201).send(await repo.create(title));
  });

  app.get<{ Params: { id: string } }>("/tasks/:id", async (req, reply) => {
    const task = await repo.get(req.params.id);
    return task ?? reply.code(404).send({ error: "introuvable" });
  });

  app.patch<{ Params: { id: string }; Body: { title?: string; done?: boolean } }>(
    "/tasks/:id",
    async (req, reply) => {
      const task = await repo.update(req.params.id, req.body ?? {});
      return task ?? reply.code(404).send({ error: "introuvable" });
    },
  );

  app.delete<{ Params: { id: string } }>("/tasks/:id", async (req, reply) => {
    const ok = await repo.remove(req.params.id);
    return reply.code(ok ? 204 : 404).send();
  });

  return app;
}
