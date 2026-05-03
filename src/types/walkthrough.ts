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

export type WalkthroughDraft = {
  id: string;
  projectName: string;
  title: string;
  contentBlocks: WalkthroughContentBlock[];
  scopeDraft: string;
  snapshots: WalkthroughSnapshot[];
  createdAt: string;
  updatedAt: string;
};