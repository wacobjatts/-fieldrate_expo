export type WalkthroughTag = "none" | "blue" | "cyan" | "orange" | "red";

export type WalkthroughContentBlock =
  | {
      id: string;
      type: "text";
      text: string;
      tag: WalkthroughTag;
      bold?: boolean;
      underline?: boolean;
      createdAt: string;
    }
  | {
      id: string;
      type: "image";
      uri: string;
      caption?: string;
      tag?: WalkthroughTag;
      createdAt: string;
    };

export type WalkthroughSnapshot = {
  id: string;
  title: string;
  projectName: string;
  contentBlocks: WalkthroughContentBlock[];
  scopeDraft: string;
  createdAt: string;
};

export type WalkthroughClientDiscovery = {
  clientConversationNotes: string;
  conceptA_description: string;
  conceptA_price: string;
  conceptA_notes: string;
  conceptB_description: string;
  conceptB_price: string;
  conceptB_notes: string;
  conceptC_description: string;
  conceptC_price: string;
  conceptC_notes: string;
  productMaterialNotes: string;
  preferredOptions: string;
  avoidConcernItems: string;
  budgetConversationNotes: string;
  basicRange: string;
  midRange: string;
  premiumRange: string;
  pricingRisks: string;
  timelineConversationNotes: string;
  idealStartWindow: string;
  requiredFinishDeadline: string;
  possiblePhases: string;
  accessDisruptionNotes: string;
};

export type WalkthroughDraft = {
  id: string;
  projectName: string;
  title: string;
  contentBlocks: WalkthroughContentBlock[];
  scopeDraft: string;
  snapshots: WalkthroughSnapshot[];
  clientDiscovery?: WalkthroughClientDiscovery;
  createdAt: string;
  updatedAt: string;
};
