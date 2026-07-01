import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// GET /api/history?q=<search>&format=json|csv
// Returns saved-response history (reviews that have at least one saved/copied
// response), searchable across review text, customer, staff, and responses.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const format = searchParams.get("format") || "json";

  const where: Prisma.ReviewWhereInput = {
    responses: { some: { OR: [{ saved: true }, { copied: true }] } },
  };
  if (q) {
    const ci = { contains: q, mode: "insensitive" } as const;
    where.OR = [
      { reviewText: ci },
      { customerName: ci },
      { staffName: ci },
      { serviceType: ci },
      { location: ci },
      { responses: { some: { responseText: ci } } },
    ];
  }

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      responses: {
        where: { OR: [{ saved: true }, { copied: true }] },
        orderBy: { createdAt: "asc" },
      },
    },
    take: 200,
  });

  if (format === "csv") {
    const csv = toCsv(reviews);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="reviewreply-history.csv"',
      },
    });
  }

  return NextResponse.json({ reviews });
}

// DELETE /api/history?id=<reviewId>   → delete one review (cascades responses)
// DELETE /api/history?all=true        → clear all history + memory
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = searchParams.get("all");

  if (all === "true") {
    await prisma.generatedResponse.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.responseMemory.deleteMany({});
    return NextResponse.json({ ok: true, cleared: "all" });
  }

  if (!id) {
    return NextResponse.json(
      { error: "Provide ?id=<reviewId> or ?all=true." },
      { status: 400 },
    );
  }
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: id });
}

type ReviewWithResponses = Prisma.ReviewGetPayload<{
  include: { responses: true };
}>;

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(reviews: ReviewWithResponses[]): string {
  const header = [
    "reviewId",
    "createdAt",
    "starRating",
    "sentiment",
    "customerName",
    "location",
    "serviceType",
    "staffName",
    "reviewText",
    "lengthType",
    "tone",
    "responseText",
    "saved",
    "copied",
    "similarityScore",
  ];
  const rows: string[] = [header.map(csvCell).join(",")];
  for (const r of reviews) {
    for (const resp of r.responses) {
      rows.push(
        [
          r.id,
          r.createdAt.toISOString(),
          r.starRating,
          r.sentiment,
          r.customerName,
          r.location,
          r.serviceType,
          r.staffName,
          r.reviewText,
          resp.lengthType,
          resp.tone,
          resp.responseText,
          resp.saved,
          resp.copied,
          resp.similarityScore.toFixed(3),
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }
  return rows.join("\n");
}
