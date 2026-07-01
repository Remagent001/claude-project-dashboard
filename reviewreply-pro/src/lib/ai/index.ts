import type { AIProvider } from "./provider";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { FallbackProvider, FALLBACK_MARKER } from "./fallback";
import type { AIResponsePayload, GenerateRequest } from "../types";

export { FALLBACK_MARKER };

/**
 * Select the AI provider based on environment configuration.
 * Priority: explicit AI_PROVIDER, then whichever key is present, then the
 * offline fallback template generator (so the app always works).
 */
export function getProvider(): AIProvider {
  const choice = (process.env.AI_PROVIDER || "").toLowerCase();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (choice === "anthropic" && anthropicKey) {
    return new AnthropicProvider(anthropicKey, process.env.ANTHROPIC_MODEL);
  }
  if (choice === "openai" && openaiKey) {
    return new OpenAIProvider(openaiKey, process.env.OPENAI_MODEL);
  }
  // No explicit choice: use whichever key exists.
  if (anthropicKey) {
    return new AnthropicProvider(anthropicKey, process.env.ANTHROPIC_MODEL);
  }
  if (openaiKey) {
    return new OpenAIProvider(openaiKey, process.env.OPENAI_MODEL);
  }
  return new FallbackProvider();
}

/**
 * When using the offline fallback provider we append a machine-readable copy of
 * the request so it can regenerate templates without parsing prose.
 */
export function withFallbackData(
  userPrompt: string,
  provider: AIProvider,
  req: GenerateRequest,
): string {
  if (provider.name.startsWith("fallback")) {
    return `${userPrompt}\n\n${FALLBACK_MARKER}${JSON.stringify(req)}`;
  }
  return userPrompt;
}

/**
 * Robustly extract the JSON object from a model completion. Handles models that
 * wrap JSON in markdown fences or add stray prose.
 */
export function parseAIResponse(raw: string): AIResponsePayload {
  let text = raw.trim();

  // Strip markdown code fences if present.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  // Otherwise, slice from the first { to the last }.
  if (!text.startsWith("{")) {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      text = text.slice(first, last + 1);
    }
  }

  const parsed = JSON.parse(text) as Partial<AIResponsePayload>;
  return {
    short: String(parsed.short ?? ""),
    standard: String(parsed.standard ?? ""),
    personalized: String(parsed.personalized ?? ""),
    riskNotes: String(parsed.riskNotes ?? ""),
    seoKeywordsUsed: Array.isArray(parsed.seoKeywordsUsed)
      ? parsed.seoKeywordsUsed.map(String)
      : [],
    duplicateRisk:
      parsed.duplicateRisk === "high" || parsed.duplicateRisk === "medium"
        ? parsed.duplicateRisk
        : "low",
  };
}
