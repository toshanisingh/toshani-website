-- CreateEnum
CREATE TYPE "ReactionTarget" AS ENUM ('PAGE', 'SECTION', 'TAG');

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_pageId_fkey";

-- DropIndex
DROP INDEX "Reaction_pageId_type_idx";

-- DropIndex
DROP INDEX "Reaction_pageId_visitorId_key";

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "pageId",
ADD COLUMN     "targetId" TEXT NOT NULL,
ADD COLUMN     "targetType" "ReactionTarget" NOT NULL;

-- CreateIndex
CREATE INDEX "Reaction_targetType_targetId_type_idx" ON "Reaction"("targetType", "targetId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_targetType_targetId_visitorId_key" ON "Reaction"("targetType", "targetId", "visitorId");

