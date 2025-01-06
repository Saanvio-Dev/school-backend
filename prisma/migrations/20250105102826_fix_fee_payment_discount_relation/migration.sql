-- CreateTable
CREATE TABLE "Discount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "condition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "finalAmount" REAL NOT NULL DEFAULT 0,
    "discountId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeePayment_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeePayment_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FeePayment" ("amount", "createdAt", "id", "month", "receiptId", "studentId", "updatedAt") SELECT "amount", "createdAt", "id", "month", "receiptId", "studentId", "updatedAt" FROM "FeePayment";
DROP TABLE "FeePayment";
ALTER TABLE "new_FeePayment" RENAME TO "FeePayment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
