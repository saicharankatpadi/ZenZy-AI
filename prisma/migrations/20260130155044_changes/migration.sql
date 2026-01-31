-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT,
    "jobDescription" TEXT,
    "resumeUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "currentPhase" TEXT NOT NULL DEFAULT 'intro',
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'technical',
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "confidence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_interviewId_orderIndex_idx" ON "Question"("interviewId", "orderIndex");

-- CreateIndex
CREATE INDEX "Answer_interviewId_idx" ON "Answer"("interviewId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
