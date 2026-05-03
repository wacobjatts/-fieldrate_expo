import { storage } from "../storage";
import type { ScopeDraft } from "../../types/scope";

const KEY = "fieldrate.scopeDrafts";

export const scopeRepository = {
  async getAll(): Promise<ScopeDraft[]> {
    return storage.get<ScopeDraft[]>(KEY, []);
  },

  async getLatest(): Promise<ScopeDraft | null> {
    const drafts = await this.getAll();
    return drafts[0] ?? null;
  },

  async save(draft: ScopeDraft): Promise<void> {
    const existing = await this.getAll();
    const withoutCurrent = existing.filter((item) => item.id !== draft.id);
    await storage.set(KEY, [draft, ...withoutCurrent]);
  },

  async remove(id: string): Promise<void> {
    const drafts = await this.getAll();
    await storage.set(
      KEY,
      drafts.filter((item) => item.id !== id)
    );
  },

  async clear(): Promise<void> {
    await storage.set(KEY, []);
  },
};