-- CreateTable
CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "cid" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "completedChapters" JSONB DEFAULT '[]',

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_cid_userEmail_key" ON "Enrollment"("cid", "userEmail");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_cid_fkey" FOREIGN KEY ("cid") REFERENCES "Course"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
