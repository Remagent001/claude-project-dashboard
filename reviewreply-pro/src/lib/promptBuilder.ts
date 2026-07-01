// Server-side prompt builder. Turns structured review data + brand settings
// into a system prompt and a user prompt for the AI provider.

import { LENGTH_BOUNDS } from "./constants";
import type { BrandSettingsDTO, GenerateRequest } from "./types";

// Star-rating-specific guidance, taken directly from the AI response strategy.
function ratingRules(star: number): string {
  if (star >= 5) {
    return [
      "This is a 5-STAR review:",
      "- Thank the customer by name if provided.",
      "- Mention the service only if known or clearly present in the review.",
      "- Mention the staff member only if provided.",
      "- Mention the location naturally if selected.",
      "- Reinforce premium men's grooming language.",
      "- Invite the guest back.",
      "- Avoid sounding fake or overly enthusiastic.",
    ].join("\n");
  }
  if (star === 4) {
    return [
      "This is a 4-STAR review:",
      "- Thank the customer.",
      "- Acknowledge the positive experience.",
      "- You may say something like: 'We'd love the chance to earn that fifth star next time.'",
      "- Do not sound needy.",
      "- Keep tone confident and polished.",
    ].join("\n");
  }
  if (star === 3) {
    return [
      "This is a 3-STAR review:",
      "- Thank the customer for the feedback.",
      "- Acknowledge that the experience may not have fully met expectations.",
      "- Invite them to contact the salon directly.",
      "- Avoid admitting legal fault.",
      "- Avoid defensiveness.",
      "- Keep it calm and recovery-focused.",
    ].join("\n");
  }
  return [
    `This is a ${star}-STAR (negative) review:`,
    "- Apologize that the experience did not meet expectations.",
    "- Do NOT argue.",
    "- Do NOT blame the customer.",
    "- Do NOT over-explain.",
    "- Do NOT reveal any private customer details.",
    "- Ask them to contact the salon directly so the issue can be addressed offline.",
    "- Stay professional — future customers will read this response.",
  ].join("\n");
}

export function buildSystemPrompt(brand: BrandSettingsDTO): string {
  return [
    `You are the review-response voice for ${brand.businessName}, a high-end men's salon / upscale barbershop in Dallas.`,
    "",
    "BRAND VOICE:",
    brand.brandVoice,
    "",
    "HARD RULES:",
    "- Sound human first. Warm, premium, professional. Never robotic, defensive, corporate, or repetitive.",
    "- Vary sentence structure and openings. Do NOT start responses with the same phrase every time.",
    `- NEVER use these forbidden/overused phrases: ${brand.forbiddenPhrases
      .map((p) => `"${p}"`)
      .join(", ")}.`,
    brand.preferredPhrases.length
      ? `- Phrases in our voice you MAY draw on (sparingly, not verbatim every time): ${brand.preferredPhrases
          .map((p) => `"${p}"`)
          .join(", ")}.`
      : "",
    "",
    "SEO RULES:",
    `- You may naturally weave in relevant keywords ONLY when appropriate: ${brand.seoKeywords.join(
      ", ",
    )}.`,
    "- Do NOT keyword-stuff. If a keyword doesn't fit naturally, leave it out.",
    "",
    "OUTPUT FORMAT:",
    "Return ONLY valid minified JSON (no markdown, no commentary) with exactly these keys:",
    "{",
    '  "short": "35-60 word response",',
    '  "standard": "70-110 word response",',
    '  "personalized": "100-140 word, more personalized response",',
    '  "riskNotes": "any safety/brand concerns, or empty string",',
    '  "seoKeywordsUsed": ["keywords you actually used"],',
    '  "duplicateRisk": "low | medium | high"',
    "}",
    "The three responses must be genuinely different in structure and opening — not three lengths of the same sentence.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildUserPrompt(
  req: GenerateRequest,
  priorResponsesToAvoid: string[],
): string {
  const parts: string[] = [];
  parts.push("Write responses to this Google review.");
  parts.push("");
  parts.push("REVIEW DETAILS:");
  parts.push(`- Star rating: ${req.starRating}`);
  parts.push(`- Review text: """${req.reviewText.trim()}"""`);
  if (req.customerName) parts.push(`- Customer name: ${req.customerName}`);
  if (req.location && req.location !== "Unknown")
    parts.push(`- Location: ${req.location} (Dallas)`);
  if (req.serviceType && req.serviceType !== "Unknown")
    parts.push(`- Service: ${req.serviceType}`);
  if (req.staffName) parts.push(`- Staff member / barber: ${req.staffName}`);
  parts.push(`- Desired tone: ${req.tone}`);
  parts.push("");

  parts.push("LENGTH TARGETS (word counts, stay within range):");
  for (const [key, b] of Object.entries(LENGTH_BOUNDS)) {
    parts.push(`- ${key}: ${b.min}-${b.max} words`);
  }
  parts.push("");

  parts.push(ratingRules(req.starRating));
  parts.push("");

  if (priorResponsesToAvoid.length) {
    parts.push(
      "AVOID DUPLICATION — do not reuse the structure, opening lines, or distinctive phrasing of these past responses:",
    );
    for (const r of priorResponsesToAvoid.slice(0, 6)) {
      parts.push(`- """${r.trim()}"""`);
    }
    parts.push("");
  }

  parts.push(
    "Remember: return ONLY the JSON object described in the system prompt.",
  );
  return parts.join("\n");
}
