export type ScopeItem = {
  id: string;
  taskName: string;
  quantity: number;

  phaseId?: string;
  phaseName?: string;
  phaseType?: "base" | "phase" | "changeOrder" | "alternate" | "allowance" | "credit";
  lineType?: "selfPerform" | "subcontractor" | "allowance" | "credit";

  subcontractorName?: string;
  subcontractorTrade?: string;
  subcontractorBid?: number;
  subcontractorMarkup?: number;

  rate?: number;
  difficulty?: number;
  contingency?: number;
  manualHours?: number;
};
