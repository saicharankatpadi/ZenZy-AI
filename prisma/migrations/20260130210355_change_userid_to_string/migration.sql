-- CreateTable
CREATE TABLE "enrollCourse" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "enrolledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpEarned" INTEGER NOT NULL,

    CONSTRAINT "enrollCourse_pkey" PRIMARY KEY ("id")
);
