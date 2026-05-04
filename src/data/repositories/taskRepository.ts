// src/data/repositories/taskRepository.ts

import { storage } from "../storage";
import type { TaskDraft } from "../../types/tasks";

const KEY = "fieldrate.taskDrafts";

export const taskRepository = {
  async getAll(): Promise<TaskDraft[]> {
    return storage.get<TaskDraft[]>(KEY, []);
  },

  async getLatest(): Promise<TaskDraft | null> {
    const drafts = await this.getAll();
    return drafts[0] ?? null;
  },

  async save(draft: TaskDraft): Promise<void> {
    const existing = await this.getAll();
    const withoutCurrent = existing.filter((item) => item.id !== draft.id);
    await storage.set(KEY, [draft, ...withoutCurrent]);
  },

  async clear(): Promise<void> {
    await storage.set(KEY, []);
  },
};
