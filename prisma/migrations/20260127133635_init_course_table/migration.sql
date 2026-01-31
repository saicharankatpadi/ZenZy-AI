-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "cid" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "noOfChapters" INTEGER NOT NULL,
    "includeVideo" BOOLEAN NOT NULL DEFAULT false,
    "level" TEXT NOT NULL,
    "catetgory" TEXT,
    "courseJson" JSONB,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
