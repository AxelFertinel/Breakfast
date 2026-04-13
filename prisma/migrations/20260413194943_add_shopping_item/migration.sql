/*
  Warnings:

  - You are about to drop the column `onboardingCompleted` on the `physical_profile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "shopping_item_userId_idx";

-- AlterTable
ALTER TABLE "physical_profile" DROP COLUMN "onboardingCompleted";

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_userId_createdAt_idx" ON "ai_usage"("userId", "createdAt");
