import { prisma } from "./prisma";
import { DEFAULT_BRAND_SETTINGS } from "./constants";
import type { BrandSettingsDTO } from "./types";

function parseList(json: string, fallback: string[]): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Load brand settings from the DB, creating the default row on first use.
 * Returns a DTO with the JSON-encoded list fields parsed into arrays.
 */
export async function getBrandSettings(): Promise<BrandSettingsDTO> {
  let row = await prisma.brandSettings.findUnique({ where: { id: "default" } });
  if (!row) {
    row = await prisma.brandSettings.create({
      data: {
        id: "default",
        businessName: DEFAULT_BRAND_SETTINGS.businessName,
        brandVoice: DEFAULT_BRAND_SETTINGS.brandVoice,
        forbiddenPhrases: JSON.stringify(DEFAULT_BRAND_SETTINGS.forbiddenPhrases),
        preferredPhrases: JSON.stringify(DEFAULT_BRAND_SETTINGS.preferredPhrases),
        locations: JSON.stringify(DEFAULT_BRAND_SETTINGS.locations),
        services: JSON.stringify(DEFAULT_BRAND_SETTINGS.services),
        seoKeywords: JSON.stringify(DEFAULT_BRAND_SETTINGS.seoKeywords),
      },
    });
  }

  return {
    id: row.id,
    businessName: row.businessName,
    brandVoice: row.brandVoice,
    forbiddenPhrases: parseList(row.forbiddenPhrases, DEFAULT_BRAND_SETTINGS.forbiddenPhrases),
    preferredPhrases: parseList(row.preferredPhrases, DEFAULT_BRAND_SETTINGS.preferredPhrases),
    locations: parseList(row.locations, DEFAULT_BRAND_SETTINGS.locations),
    services: parseList(row.services, DEFAULT_BRAND_SETTINGS.services),
    seoKeywords: parseList(row.seoKeywords, DEFAULT_BRAND_SETTINGS.seoKeywords),
  };
}

/** Persist a partial update to brand settings. List fields are JSON-encoded. */
export async function updateBrandSettings(
  patch: Partial<Omit<BrandSettingsDTO, "id">>,
): Promise<BrandSettingsDTO> {
  await getBrandSettings(); // ensure the row exists
  await prisma.brandSettings.update({
    where: { id: "default" },
    data: {
      ...(patch.businessName !== undefined && { businessName: patch.businessName }),
      ...(patch.brandVoice !== undefined && { brandVoice: patch.brandVoice }),
      ...(patch.forbiddenPhrases !== undefined && {
        forbiddenPhrases: JSON.stringify(patch.forbiddenPhrases),
      }),
      ...(patch.preferredPhrases !== undefined && {
        preferredPhrases: JSON.stringify(patch.preferredPhrases),
      }),
      ...(patch.locations !== undefined && { locations: JSON.stringify(patch.locations) }),
      ...(patch.services !== undefined && { services: JSON.stringify(patch.services) }),
      ...(patch.seoKeywords !== undefined && { seoKeywords: JSON.stringify(patch.seoKeywords) }),
    },
  });
  return getBrandSettings();
}
