import { storage } from "../storage";

const KEY = "fieldrate.activeProjectId";

export const activeProjectRepository = {
  async get(): Promise<string | null> {
    return storage.get<string | null>(KEY, null);
  },

  async set(id: string): Promise<void> {
    await storage.set(KEY, id);
  },

  async clear(): Promise<void> {
    await storage.remove(KEY);
  },
};
