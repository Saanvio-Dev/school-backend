/*
  Warnings:

  - You are about to drop the column `description` on the `Fee` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalFees` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_StudentFees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_StudentFees_A_fkey" FOREIGN KEY ("A") REFERENCES "Fee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StudentFees_B_fkey" FOREIGN KEY ("B") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Class" ("id", "name") SELECT "id", "name" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
CREATE TABLE "new_Fee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "feeType" TEXT NOT NULL,
    "classId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Fee_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Fee" ("amount", "classId", "feeType", "id") SELECT "amount", "classId", "feeType", "id" FROM "Fee";
DROP TABLE "Fee";
ALTER TABLE "new_Fee" RENAME TO "Fee";
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "id", "paymentDate", "receiptNo", "studentId") SELECT "amount", "id", "paymentDate", "receiptNo", "studentId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_receiptNo_key" ON "Payment"("receiptNo");
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "totalFees" REAL NOT NULL,
    "paidFees" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "classId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("admissionNo", "classId", "id", "name") SELECT "admissionNo", "classId", "id", "name" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_admissionNo_key" ON "Student"("admissionNo");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("email", "id", "password", "role") SELECT "email", "id", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_StudentFees_AB_unique" ON "_StudentFees"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentFees_B_index" ON "_StudentFees"("B");
