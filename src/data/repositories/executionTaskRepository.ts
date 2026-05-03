import { storage } from "../storage";
import type { ExecutionTask } from "../../types/executionTask";

const KEY = "fieldrate.executionTasks";

export const executionTaskRepository = {
  async getAll(): Promise<ExecutionTask[]> {
    return storage.get<ExecutionTask[]>(KEY, []);
  },

  async saveMany(tasks: ExecutionTask[]): Promise<void> {
    const existing = await this.getAll();
    await storage.set(KEY, [...tasks, ...existing]);
  },

  async update(task: ExecutionTask): Promise<void> {
    const tasks = await this.getAll();
    await storage.set(
      KEY,
      tasks.map((item) => (item.id === task.id ? task : item))
    );
  },

  async remove(id: string): Promise<void> {
    const tasks = await this.getAll();
    await storage.set(
      KEY,
      tasks.filter((item) => item.id !== id)
    );
  },
};