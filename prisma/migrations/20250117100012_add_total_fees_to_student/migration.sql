-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "paidFees" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "totalFees" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "parentName" TEXT,
    "classId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("admissionNo", "balance", "classId", "createdAt", "dateOfBirth", "id", "name", "paidFees", "parentName", "status", "updatedAt") SELECT "admissionNo", "balance", "classId", "createdAt", "dateOfBirth", "id", "name", "paidFees", "parentName", "status", "updatedAt" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_admissionNo_key" ON "Student"("admissionNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
