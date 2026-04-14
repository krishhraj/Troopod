export interface PageElements {
  title: string;
  h1: string;
  subheadings: string[];
  ctaTexts: string[];
  metaDescription: string;
}

export interface PersonalizationResult {
  original: PageElements;
  personalized: PageElements;
  changes: ChangeItem[];
  cro_insights: string[];
}

export interface ChangeItem {
  element: string;
  original: string;
  personalized: string;
  reason: string;
}

export interface ApiRequest {
  adCreative: string;
  landingPageUrl: string;
}

export interface ApiResponse {
  success: boolean;
  data?: PersonalizationResult;
  error?: string;
  scrapedHtml?: string;
}

export type LoadingStage =
  | "idle"
  | "scraping"
  | "parsing"
  | "analyzing"
  | "personalizing"
  | "rendering"
  | "done"
  | "error";

export const LOADING_STAGES: Record<string, { label: string; detail: string; progress: number }> = {
  scraping: {
    label: "Extracting Page Content...",
    detail: "Fetching HTML and identifying key elements",
    progress: 20,
  },
  parsing: {
    label: "Parsing Structure...",
    detail: "Identifying headlines, CTAs, and conversion elements",
    progress: 40,
  },
  analyzing: {
    label: "Analyzing Ad Intent...",
    detail: "Matching hooks, messaging, and audience signals",
    progress: 60,
  },
  personalizing: {
    label: "Applying CRO Principles...",
    detail: "Rewriting with message-match and conversion intent",
    progress: 80,
  },
  rendering: {
    label: "Rendering Preview...",
    detail: "Injecting optimized copy into live page structure",
    progress: 95,
  },
};
