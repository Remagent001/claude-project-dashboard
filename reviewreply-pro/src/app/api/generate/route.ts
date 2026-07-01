import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBrandSettings } from "@/lib/brand";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/promptBuilder";
import {
  getProvider,
  parseAIResponse,
  withFallbackData,
} from "@/lib/ai";
import {
  scoreAgainstMemory,
  SIMILARITY_WARNING_THRESHOLD,
} from "@/lib/similarity";
import { LENGTH_TYPES } from "@/lib/constants";
import type {
  GenerateRequest,
  GenerateResult,
  ScoredOption,
} from "@/lib/types";

export const runtime = "nodejs";

function inferSentiment(star: number): string {
  if (star >= 4) return "positive";
  if (star === 3) return "neutral";
  return "negative";
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.reviewText || !body.reviewText.trim()) {
    return NextResponse.json(
      { error: "reviewText is required." },
      { status: 400 },
    );
  }
  const star = Number(body.starRating);
  if (!Number.isInteger(star) || star < 1 || star > 5) {
    return NextResponse.json(
      { error: "starRating must be an integer 1-5." },
      { status: 400 },
    );
  }
  const tone = body.tone || "Warm";

  try {
    const brand = await getBrandSettings();
    const provider = getProvider();

    // Pull recent response memory (scoped to same location/service where set)
    // as examples to avoid, and for similarity scoring.
    const memory = await prisma.responseMemory.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { responseText: true, normalizedText: true },
    });

    const priorToAvoid = memory.slice(0, 6).map((m) => m.responseText);

    const systemPrompt = buildSystemPrompt(brand);
    const request: GenerateRequest = { ...body, starRating: star, tone };
    let userPrompt = buildUserPrompt(request, priorToAvoid);
    userPrompt = withFallbackData(userPrompt, provider, request);

    const raw = await provider.complete(systemPrompt, userPrompt);
    const ai = parseAIResponse(raw);

    // Persist the review.
    const review = await prisma.review.create({
      data: {
        reviewText: body.reviewText.trim(),
        starRating: star,
        customerName: body.customerName?.trim() || null,
        location: body.location || null,
        serviceType: body.serviceType || null,
        staffName: body.staffName?.trim() || null,
        sentiment: inferSentiment(star),
      },
    });

    // Score each length variant against memory and persist as GeneratedResponse.
    const options: ScoredOption[] = [];
    for (const lengthType of LENGTH_TYPES) {
      const text = ai[lengthType];
      if (!text) continue;
      const hit = scoreAgainstMemory(text, memory);
      const created = await prisma.generatedResponse.create({
        data: {
          reviewId: review.id,
          responseText: text,
          tone,
          lengthType,
          similarityScore: hit.score,
        },
      });
      options.push({
        responseId: created.id,
        lengthType,
        text,
        wordCount: wordCount(text),
        similarityScore: hit.score,
        similarWarning: hit.score >= SIMILARITY_WARNING_THRESHOLD,
        closestMatch:
          hit.score >= SIMILARITY_WARNING_THRESHOLD ? hit.closest : undefined,
      });
    }

    // If our own similarity check finds a near-duplicate, escalate the risk
    // level the AI self-reported.
    const maxSim = Math.max(0, ...options.map((o) => o.similarityScore));
    let duplicateRisk = ai.duplicateRisk;
    if (maxSim >= SIMILARITY_WARNING_THRESHOLD) duplicateRisk = "high";
    else if (maxSim >= 0.4 && duplicateRisk === "low") duplicateRisk = "medium";

    const result: GenerateResult = {
      reviewId: review.id,
      options,
      riskNotes: ai.riskNotes,
      seoKeywordsUsed: ai.seoKeywordsUsed,
      duplicateRisk,
      provider: provider.name,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate responses.",
      },
      { status: 500 },
    );
  }
}
