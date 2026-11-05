import pg from "pg";
import { buildApp } from "./app.js";
import { PgTaskRepository } from "./pg-tasks.js";

let repo;
if (process.env.DATABASE_URL) {
  const pgRepo = new PgTaskRepository(
    new pg.Pool({ connectionString: process.env.DATABASE_URL }),
  );
  await pgRepo.init();
  repo = pgRepo;
}

const app = buildApp(repo);
await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });
