/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `classes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "classes" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "fee_structures" ADD COLUMN "deletedAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

-- CreateIndex
CREATE INDEX "fee_structures_classId_idx" ON "fee_structures"("classId");
