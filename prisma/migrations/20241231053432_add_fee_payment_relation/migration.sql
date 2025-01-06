/*
  Warnings:

  - You are about to drop the column `paidDate` on the `FeePayment` table. All the data in the column will be lost.
  - Added the required column `receiptId` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FeePayment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Receipt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Receipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeePayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiptId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeePayment_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FeePayment" ("amount", "id", "month", "studentId") SELECT "amount", "id", "month", "studentId" FROM "FeePayment";
DROP TABLE "FeePayment";
ALTER TABLE "new_FeePayment" RENAME TO "FeePayment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
