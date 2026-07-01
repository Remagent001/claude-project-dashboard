import { NextRequest, NextResponse } from "next/server";
import { getBrandSettings, updateBrandSettings } from "@/lib/brand";
import type { BrandSettingsDTO } from "@/lib/types";

export const runtime = "nodejs";

// GET /api/settings — current brand voice / SEO settings.
export async function GET() {
  const settings = await getBrandSettings();
  return NextResponse.json({ settings });
}

// PUT /api/settings — update brand voice / SEO settings.
export async function PUT(req: NextRequest) {
  let body: Partial<Omit<BrandSettingsDTO, "id">>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const settings = await updateBrandSettings(body);
  return NextResponse.json({ settings });
}
