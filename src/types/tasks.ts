// src/types/tasks.ts

export type TaskExecutionSource = "scope" | "manual";
export type TaskStatus = "draft" | "planned" | "in-progress" | "complete";

export type TaskItem = {
  id: string;
  projectId?: string;
  projectName?: string;
  scopeItemId?: string;
  scopeItemTitle?: string;
  source: TaskExecutionSource;
  title: string;
  description: string;
  executionType: "selfPerform" | "subcontractor";
  materialType: "fixed" | "allowance";
  quantity?: number;
  unit?: string;
  crewSize?: number;
  estimatedHours?: number;
  estimatedManHours?: number;
  productionRate?: number;
  productionUnit?: string;
  notes?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskDraft = {
  id: string;
  projectId?: string;
  projectName?: string;
  tasks: TaskItem[];
  createdAt: string;
  updatedAt: string;
};
