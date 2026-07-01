// Shared types for the generate flow.

export interface GenerateRequest {
  reviewText: string;
  starRating: number;
  location?: string;
  serviceType?: string;
  staffName?: string;
  customerName?: string;
  tone: string;
}

// The strict JSON contract we ask the AI model to return.
export interface AIResponsePayload {
  short: string;
  standard: string;
  personalized: string;
  riskNotes: string;
  seoKeywordsUsed: string[];
  duplicateRisk: "low" | "medium" | "high";
}

// A generated option enriched with our own similarity analysis.
export interface ScoredOption {
  responseId: string; // GeneratedResponse row id, for save/copy actions
  lengthType: "short" | "standard" | "personalized";
  text: string;
  wordCount: number;
  similarityScore: number; // 0..1 against prior response memory
  similarWarning: boolean;
  closestMatch?: string;
}

export interface GenerateResult {
  reviewId: string;
  options: ScoredOption[];
  riskNotes: string;
  seoKeywordsUsed: string[];
  duplicateRisk: "low" | "medium" | "high";
  provider: string;
}

export interface BrandSettingsDTO {
  id: string;
  businessName: string;
  brandVoice: string;
  forbiddenPhrases: string[];
  preferredPhrases: string[];
  locations: string[];
  services: string[];
  seoKeywords: string[];
}
