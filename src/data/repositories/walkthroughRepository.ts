import { storage } from "../storage";
import type { WalkthroughDraft } from "../../types/walkthrough";

const KEY = "fieldrate.walkthroughDrafts";

export const walkthroughRepository = {
  async getAll(): Promise<WalkthroughDraft[]> {
    return storage.get<WalkthroughDraft[]>(KEY, []);
  },

  async getLatest(): Promise<WalkthroughDraft | null> {
    const drafts = await this.getAll();
    return drafts[0] ?? null;
  },

  async save(draft: WalkthroughDraft): Promise<void> {
    const existing = await this.getAll();
    const withoutCurrent = existing.filter((item) => item.id !== draft.id);
    await storage.set(KEY, [draft, ...withoutCurrent]);
  },

  async clear(): Promise<void> {
    await storage.set(KEY, []);
  },
};