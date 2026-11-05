import { randomUUID } from "node:crypto";

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskRepository {
  list(): Promise<Task[]>;
  get(id: string): Promise<Task | undefined>;
  create(title: string): Promise<Task>;
  update(
    id: string,
    patch: { title?: string; done?: boolean },
  ): Promise<Task | undefined>;
  remove(id: string): Promise<boolean>;
}

/** Dépôt en mémoire : suffisant pour les tests unitaires (séance 1). */
export class InMemoryTaskRepository implements TaskRepository {
  private tasks = new Map<string, Task>();

  async list() {
    return [...this.tasks.values()];
  }
  async get(id: string) {
    return this.tasks.get(id);
  }
  async create(title: string) {
    const task: Task = { id: randomUUID(), title, done: false };
    this.tasks.set(task.id, task);
    return task;
  }
  async update(id: string, patch: { title?: string; done?: boolean }) {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...patch };
    this.tasks.set(id, updated);
    return updated;
  }
  async remove(id: string) {
    return this.tasks.delete(id);
  }
}
