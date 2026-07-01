// Provider-agnostic interface for the AI layer.
// Any provider (Anthropic, OpenAI, or the offline fallback) implements this,
// so the rest of the app never depends on a specific vendor SDK.

export interface AIProvider {
  name: string;
  /**
   * Given a system prompt and a user prompt, return the raw text completion.
   * The prompt itself instructs the model to return JSON; parsing/validation
   * happens in the generate route.
   */
  complete(systemPrompt: string, userPrompt: string): Promise<string>;
}
