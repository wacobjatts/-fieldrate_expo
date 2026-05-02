export type ProductionUnit = "EA" | "LF" | "SF" | "CY";

export type WorkLogStatusTag = "standard" | "exceptional" | "problem";

export type WorkLog = {
  id: string;
  jobId: string;
  jobName: string;
  phase?: string;
  date: string;

  taskName: string;
  quantity: number;
  unit: ProductionUnit;

  crewSize: number;
  hours: number;
  manHours: number;
  mhPerUnit: number;

  ratePerHour?: number;
  laborCost?: number;

  workFlow: number;
  planAccuracy: number;
  crewEfficiency: number;
  conditionImpact: number;
  communication: number;
  difficulty: 1 | 2 | 3 | 4 | 5;

  statusTag: WorkLogStatusTag;
  notes?: string;
  weather?: string;
};
