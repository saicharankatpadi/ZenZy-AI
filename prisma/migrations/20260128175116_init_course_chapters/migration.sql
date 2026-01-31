-- CreateTable
CREATE TABLE "courseChapters" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "exercises" JSONB NOT NULL,

    CONSTRAINT "courseChapters_pkey" PRIMARY KEY ("id")
);
