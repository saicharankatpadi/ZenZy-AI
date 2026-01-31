-- CreateTable
CREATE TABLE "JobAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobUrl" TEXT,
    "jobTitle" TEXT,
    "companyName" TEXT NOT NULL,
    "companyDomain" TEXT,
    "companyLogo" TEXT,
    "companySize" TEXT,
    "companyFunding" TEXT,
    "companyIndustry" TEXT,
    "ghostJobScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "redFlags" JSONB,
    "pros" JSONB,
    "cons" JSONB,
    "userMatchScore" INTEGER,
    "missingSkills" JSONB,
    "matchingSkills" JSONB,
    "recentNews" JSONB,
    "financialHealth" JSONB,
    "hiringTrends" JSONB,
    "jobDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'analyzing',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAnalysis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobAnalysis" ADD CONSTRAINT "JobAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
