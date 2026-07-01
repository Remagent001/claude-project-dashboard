import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalize } from "@/lib/similarity";

export const runtime = "nodejs";

// POST /api/responses
// Body: { responseId: string, action: "save" | "copy" }
// Marks the response saved/copied and records it in ResponseMemory so future
// generations are checked against it for duplicates.
export async function POST(req: NextRequest) {
  let body: { responseId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { responseId, action } = body;
  if (!responseId || (action !== "save" && action !== "copy")) {
    return NextResponse.json(
      { error: "responseId and action ('save'|'copy') are required." },
      { status: 400 },
    );
  }

  const response = await prisma.generatedResponse.findUnique({
    where: { id: responseId },
    include: { review: true },
  });
  if (!response) {
    return NextResponse.json({ error: "Response not found." }, { status: 404 });
  }

  await prisma.generatedResponse.update({
    where: { id: responseId },
    data: action === "save" ? { saved: true } : { copied: true },
  });

  // Record in memory once (avoid piling up duplicates of the exact same text).
  const existing = await prisma.responseMemory.findFirst({
    where: { responseText: response.responseText },
  });
  if (!existing) {
    await prisma.responseMemory.create({
      data: {
        responseText: response.responseText,
        normalizedText: normalize(response.responseText),
        location: response.review.location,
        serviceType: response.review.serviceType,
        tone: response.tone,
        starRating: response.review.starRating,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
