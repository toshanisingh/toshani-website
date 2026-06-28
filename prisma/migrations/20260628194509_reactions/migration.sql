-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LOVE');

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reaction_pageId_type_idx" ON "Reaction"("pageId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_pageId_visitorId_key" ON "Reaction"("pageId", "visitorId");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
