/*
  Warnings:

  - A unique constraint covering the columns `[cid]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_cid_key" ON "Course"("cid");
