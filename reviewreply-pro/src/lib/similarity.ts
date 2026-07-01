// Similarity utilities for duplicate-response detection.
//
// This is intentionally dependency-free (token-overlap + cosine on term
// frequencies). It's good enough to catch near-duplicate phrasing, and the
// interface leaves room to swap in embeddings later without touching callers.

const FILLER_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "so", "to", "of", "in", "on", "at",
  "for", "with", "your", "you", "our", "we", "us", "it", "is", "are", "was",
  "were", "be", "been", "being", "this", "that", "these", "those", "as", "by",
  "from", "here", "there", "very", "really", "just", "too", "also",
]);

/**
 * Normalize a response for comparison: lowercase, strip punctuation, collapse
 * whitespace, and remove common filler words.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !FILLER_WORDS.has(w))
    .join(" ");
}

function tokenize(normalizedText: string): string[] {
  return normalizedText.split(/\s+/).filter(Boolean);
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

/**
 * Cosine similarity over term-frequency vectors of two already-normalized
 * strings. Returns a value in [0, 1].
 */
export function cosineSimilarity(normA: string, normB: string): number {
  const a = termFrequency(tokenize(normA));
  const b = termFrequency(tokenize(normB));
  if (a.size === 0 || b.size === 0) return 0;

  let dot = 0;
  for (const [term, freq] of a) {
    const bf = b.get(term);
    if (bf) dot += freq * bf;
  }

  let magA = 0;
  for (const freq of a.values()) magA += freq * freq;
  let magB = 0;
  for (const freq of b.values()) magB += freq * freq;

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export interface SimilarityHit {
  score: number; // 0..1, highest match found
  closest?: string; // the prior response text that matched best
}

/**
 * Compare a candidate response against a set of prior (normalized, original)
 * responses and return the highest similarity found.
 */
export function scoreAgainstMemory(
  candidate: string,
  memory: { normalizedText: string; responseText: string }[],
): SimilarityHit {
  const normCandidate = normalize(candidate);
  let best: SimilarityHit = { score: 0 };
  for (const m of memory) {
    const score = cosineSimilarity(normCandidate, m.normalizedText);
    if (score > best.score) best = { score, closest: m.responseText };
  }
  return best;
}

// Above this cosine score, we surface a "similar to one you've used" warning.
export const SIMILARITY_WARNING_THRESHOLD = 0.6;

/** Extract the opening line (first ~8 words) of a response, normalized. */
export function openingLine(text: string): string {
  return normalize(text).split(/\s+/).slice(0, 8).join(" ");
}
