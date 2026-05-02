import { storage } from "../storage";
import type { Project } from "../../types/project";

const KEY = "fieldrate.projects";

export const projectRepository = {
  async getAll(): Promise<Project[]> {
    return storage.get<Project[]>(KEY, []);
  },

  async create(project: Project): Promise<void> {
    const projects = await this.getAll();
    await storage.set(KEY, [project, ...projects]);
  },

  async update(project: Project): Promise<void> {
    const projects = await this.getAll();

    const next = projects.map((item) => {
      if (item.id !== project.id) return item;

      const snapshot = {
        scope: item.scope,
        rate: item.rate,
        difficulty: item.difficulty,
        contingency: item.contingency,
        timestamp: Date.now(),
      };

      return {
        ...project,
        snapshots: [...(item.snapshots || []), snapshot],
      };
    });

    await storage.set(KEY, next);
  },

  async restore(projectId: string, snapshotIndex: number): Promise<void> {
    const projects = await this.getAll();

    const next = projects.map((project) => {
      if (project.id !== projectId) return project;

      const snapshot = project.snapshots?.[snapshotIndex];
      if (snapshot === undefined) return project;

      const currentSnapshot = {
        scope: project.scope,
        rate: project.rate,
        difficulty: project.difficulty,
        contingency: project.contingency,
        timestamp: Date.now(),
      };

      return {
        ...project,
        scope: snapshot.scope,
        rate: snapshot.rate,
        difficulty: snapshot.difficulty,
        contingency: snapshot.contingency,
        snapshots: [...(project.snapshots || []), currentSnapshot],
      };
    });

    await storage.set(KEY, next);
  },

  async remove(id: string): Promise<void> {
    const projects = await this.getAll();
    await storage.set(
      KEY,
      projects.filter((item) => item.id !== id)
    );
  },
};
