export type ExecutionTaskStatus = "pending" | "in-progress" | "completed";

export type ExecutionTask = {
  id: string;
  name: string;
  status: ExecutionTaskStatus;

  // Optional context
  jobName?: string;
  quantity?: number;
  unit?: string;

  // Source tracking
  source?: "task-breakdown" | "manual";

  createdAt: string;
};