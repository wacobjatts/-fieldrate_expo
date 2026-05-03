export type ScopeExecutionType = "selfPerform" | "subcontractor";
export type ScopeMaterialType = "fixed" | "allowance";
export type ScopeStatus = "draft" | "reviewed" | "approved" | "sent-to-estimate";

export type ScopeComponent = {
  id: string;
  description: string;
  quantity?: number;
  unit?: string;
};

export type ScopeItem = {
  id: string;
  projectId?: string;

  title: string;
  description: string;

  components: ScopeComponent[];

  executionType: ScopeExecutionType;
  subcontractorName?: string;
  subcontractorNotes?: string;

  materialType: ScopeMaterialType;
  allowanceAmount?: number;
  allowanceNote?: string;

  inclusions: string[];
  exclusions: string[];
  notes?: string;

  status: ScopeStatus;

  createdAt: string;
  updatedAt: string;
};

export type ScopeDraft = {
  id: string;
  projectId?: string;
  projectName?: string;

  rawNotes?: string;
  scopeDraftText?: string;

  items: ScopeItem[];

  globalInclusions: string[];
  globalExclusions: string[];
  globalNotes?: string;

  status: ScopeStatus;

  createdAt: string;
  updatedAt: string;
};