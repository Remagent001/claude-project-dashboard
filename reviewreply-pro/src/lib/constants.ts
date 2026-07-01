// Shared option lists and defaults used by both the UI and the server.

export const LOCATIONS = [
  "Preston Hollow",
  "West Village",
  "Unknown",
] as const;

export const SERVICE_TYPES = [
  "Haircut",
  "Beard Trim",
  "Straight Razor Shave",
  "Facial",
  "Gray Blending",
  "Beard Coloring",
  "Scalp Treatment",
  "Waxing",
  "Brazilian Blowout",
  "Relaxer/Smoothing Treatment",
  "Other",
  "Unknown",
] as const;

export const TONES = [
  "Warm",
  "Premium",
  "Friendly",
  "Short",
  "Apologetic",
  "Recovery-focused",
] as const;

export const STAR_RATINGS = [1, 2, 3, 4, 5] as const;

export const LENGTH_TYPES = ["short", "standard", "personalized"] as const;

// Length targets (word counts) per the spec.
export const LENGTH_BOUNDS: Record<
  (typeof LENGTH_TYPES)[number],
  { min: number; max: number; label: string }
> = {
  short: { min: 35, max: 60, label: "Short" },
  standard: { min: 70, max: 110, label: "Standard" },
  personalized: { min: 100, max: 140, label: "Personalized" },
};

// SEO keywords the model may weave in — only when natural, never stuffed.
export const SEO_KEYWORDS = [
  "men's haircut",
  "men's grooming",
  "barber",
  "men's salon",
  "beard trim",
  "straight razor shave",
  "facial",
  "gray blending",
  "Dallas",
  "Preston Hollow",
  "West Village",
];

// Default brand settings seeded into the DB and used as a fallback.
export const DEFAULT_BRAND_SETTINGS = {
  id: "default",
  businessName: "Eighteen Eight Fine Men's Salon",
  brandVoice:
    "Warm, premium, human, and professional. We speak like a confident, gracious host at a high-end men's grooming lounge — never robotic, defensive, overly corporate, or repetitive. We reinforce a refined men's grooming experience without bragging.",
  forbiddenPhrases: [
    "We're so glad to hear",
    "Thank you for your kind words",
    "We appreciate your feedback",
    "valued customer",
    "at the end of the day",
    "reach out",
    "touch base",
  ],
  preferredPhrases: [
    "It was a pleasure having you in the chair",
    "We look forward to your next visit",
    "Our team takes real pride in the details",
  ],
  locations: ["Preston Hollow", "West Village"],
  services: [...SERVICE_TYPES].filter((s) => s !== "Unknown" && s !== "Other"),
  seoKeywords: SEO_KEYWORDS,
};

export type LengthType = (typeof LENGTH_TYPES)[number];
export type Tone = (typeof TONES)[number];
