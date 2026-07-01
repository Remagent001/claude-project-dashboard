-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewText" TEXT NOT NULL,
    "starRating" INTEGER NOT NULL,
    "customerName" TEXT,
    "location" TEXT,
    "serviceType" TEXT,
    "staffName" TEXT,
    "sentiment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GeneratedResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "lengthType" TEXT NOT NULL,
    "copied" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "similarityScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedResponse_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BrandSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "businessName" TEXT NOT NULL,
    "brandVoice" TEXT NOT NULL,
    "forbiddenPhrases" TEXT NOT NULL,
    "preferredPhrases" TEXT NOT NULL,
    "locations" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "seoKeywords" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResponseMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "responseText" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "location" TEXT,
    "serviceType" TEXT,
    "tone" TEXT,
    "starRating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "GeneratedResponse_reviewId_idx" ON "GeneratedResponse"("reviewId");

-- CreateIndex
CREATE INDEX "ResponseMemory_location_idx" ON "ResponseMemory"("location");

-- CreateIndex
CREATE INDEX "ResponseMemory_serviceType_idx" ON "ResponseMemory"("serviceType");
