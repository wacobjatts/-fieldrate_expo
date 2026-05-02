import type { ScopeItem } from "./scope";

export type ProjectSnapshot = {
  scope: ScopeItem[];
  rate: number;
  difficulty: number;
  contingency: number;
  timestamp: number;
};

export type Project = {
  id: string;
  name: string;

  scope: ScopeItem[];

  rate: number;
  difficulty: number;
  contingency: number;

  snapshots?: ProjectSnapshot[];

  createdAt: number;
};
