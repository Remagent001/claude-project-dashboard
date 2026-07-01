// Seeds default brand settings. Safe to run repeatedly (upsert).
import { PrismaClient } from "@prisma/client";
import { DEFAULT_BRAND_SETTINGS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  await prisma.brandSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
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
  console.log("✓ Seeded default brand settings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
