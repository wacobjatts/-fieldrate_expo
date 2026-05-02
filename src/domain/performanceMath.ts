import type { WorkLog } from "../types/log";

export type TaskRateSummary = {
  taskName: string;
  unit: WorkLog["unit"];
  logCount: number;
  totalQuantity: number;
  totalManHours: number;
  averageMHPerUnit: number;
  bestMHPerUnit: number;
  worstMHPerUnit: number;
  averageDifficulty: number;
};

export function summarizeLogsByTask(logs: WorkLog[]): TaskRateSummary[] {
  const groups = new Map<string, WorkLog[]>();

  for (const log of logs) {
    const key = `${log.taskName.trim().toLowerCase()}::${log.unit}`;
    const group = groups.get(key) ?? [];
    group.push(log);
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .map((group) => {
      const first = group[0];
      const totalQuantity = sum(group.map((log) => log.quantity));
      const totalManHours = sum(group.map((log) => log.manHours));
      const rates = group.map((log) => log.mhPerUnit).filter(Number.isFinite);
      const difficulties = group.map((log) => log.difficulty);

      return {
        taskName: first.taskName,
        unit: first.unit,
        logCount: group.length,
        totalQuantity,
        totalManHours,
        averageMHPerUnit: totalQuantity === 0 ? 0 : totalManHours / totalQuantity,
        bestMHPerUnit: rates.length ? Math.min(...rates) : 0,
        worstMHPerUnit: rates.length ? Math.max(...rates) : 0,
        averageDifficulty: difficulties.length ? sum(difficulties) / difficulties.length : 0,
      };
    })
    .sort((a, b) => b.logCount - a.logCount || a.taskName.localeCompare(b.taskName));
}

export function calculateOverallAverageMHPerUnit(logs: WorkLog[]) {
  const totalQuantity = sum(logs.map((log) => log.quantity));
  const totalManHours = sum(logs.map((log) => log.manHours));
  if (totalQuantity === 0) return 0;
  return totalManHours / totalQuantity;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
