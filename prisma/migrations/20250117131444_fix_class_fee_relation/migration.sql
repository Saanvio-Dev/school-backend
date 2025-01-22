/*
  Warnings:

  - You are about to drop the `Fee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StudentFees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `totalFees` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `feeStructureId` on the `classes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[classId]` on the table `fee_structures` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "_StudentFees_B_index";

-- DropIndex
DROP INDEX "_StudentFees_AB_unique";

-- DropIndex
DROP INDEX "fee_structures_classId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Fee";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_StudentFees";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "paidFees" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "parentName" TEXT,
    "classId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("admissionNo", "balance", "classId", "createdAt", "dateOfBirth", "id", "name", "paidFees", "parentName", "status", "updatedAt") SELECT "admissionNo", "balance", "classId", "createdAt", "dateOfBirth", "id", "name", "paidFees", "parentName", "status", "updatedAt" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_admissionNo_key" ON "Student"("admissionNo");
CREATE TABLE "new_classes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_classes" ("createdAt", "deletedAt", "id", "name", "updatedAt") SELECT "createdAt", "deletedAt", "id", "name", "updatedAt" FROM "classes";
DROP TABLE "classes";
ALTER TABLE "new_classes" RENAME TO "classes";
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "fee_structures_classId_key" ON "fee_structures"("classId");
