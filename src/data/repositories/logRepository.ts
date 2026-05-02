import { storage } from "../storage";
import type { WorkLog } from "../../types/log";

const LOG_KEY = "fieldrate.workLogs";

export const logRepository = {
  async getAll(): Promise<WorkLog[]> {
    return storage.get<WorkLog[]>(LOG_KEY, []);
  },

  async save(log: WorkLog): Promise<void> {
    const logs = await this.getAll();
    const next = [log, ...logs.filter((item) => item.id !== log.id)];
    await storage.set(LOG_KEY, next);
  },

  async remove(id: string): Promise<void> {
    const logs = await this.getAll();
    await storage.set(
      LOG_KEY,
      logs.filter((item) => item.id !== id)
    );
  },

  async clear(): Promise<void> {
    await storage.set(LOG_KEY, []);
  },
};
