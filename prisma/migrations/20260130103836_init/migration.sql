/*
  Warnings:

  - You are about to drop the column `companyDomain` on the `JobAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `companyFunding` on the `JobAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `JobAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `hiringTrends` on the `JobAnalysis` table. All the data in the column will be lost.
  - Made the column `userMatchScore` on table `JobAnalysis` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "JobAnalysis" DROP COLUMN "companyDomain",
DROP COLUMN "companyFunding",
DROP COLUMN "error",
DROP COLUMN "hiringTrends",
ADD COLUMN     "companyFounded" TEXT,
ADD COLUMN     "githubData" JSONB,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "recommendation" TEXT NOT NULL DEFAULT 'skip',
ADD COLUMN     "salary" TEXT,
ALTER COLUMN "userMatchScore" SET NOT NULL,
ALTER COLUMN "userMatchScore" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "JobAnalysis_userId_idx" ON "JobAnalysis"("userId");

-- CreateIndex
CREATE INDEX "JobAnalysis_status_idx" ON "JobAnalysis"("status");
