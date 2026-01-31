-- CreateTable
CREATE TABLE "Model" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "bannerImage" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "tags" TEXT,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Model_courseId_key" ON "Model"("courseId");
