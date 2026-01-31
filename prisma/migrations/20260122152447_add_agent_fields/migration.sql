-- CreateTable
CREATE TABLE "historyTable" (
    "id" SERIAL NOT NULL,
    "recordId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "userEmail" TEXT NOT NULL,
    "aiAgentType" TEXT NOT NULL,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historyTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "historyTable_recordId_key" ON "historyTable"("recordId");

-- CreateIndex
CREATE INDEX "historyTable_userEmail_idx" ON "historyTable"("userEmail");
