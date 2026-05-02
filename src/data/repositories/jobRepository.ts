import { storage } from "../storage";
import type { Job } from "../../types/job";

const JOB_KEY = "fieldrate.jobs";

export const jobRepository = {
  async getAll(): Promise<Job[]> {
    return storage.get<Job[]>(JOB_KEY, []);
  },

  async save(job: Job): Promise<void> {
    const jobs = await this.getAll();
    const next = [job, ...jobs.filter((item) => item.id !== job.id)];
    await storage.set(JOB_KEY, next);
  },

  async remove(id: string): Promise<void> {
    const jobs = await this.getAll();
    await storage.set(
      JOB_KEY,
      jobs.filter((item) => item.id !== id)
    );
  },
};
