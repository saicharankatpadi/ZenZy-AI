/*
  Warnings:

  - You are about to drop the column `currentPhase` on the `Interview` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[interviewId,questionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - Made the column `jobTitle` on table `Interview` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "currentPhase",
ADD COLUMN     "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "jobTitle" SET NOT NULL;

-- CreateTable
CREATE TABLE "completedExercise" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "completedExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "categoryScores" JSONB NOT NULL,
    "strengths" TEXT[],
    "areasForImprovement" TEXT[],
    "finalAssessment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_interviewId_key" ON "Feedback"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_interviewId_questionId_key" ON "Answer"("interviewId", "questionId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
