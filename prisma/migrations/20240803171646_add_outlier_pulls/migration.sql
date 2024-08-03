-- CreateTable
CREATE TABLE "outlier_pulls" (
    "pullId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    CONSTRAINT "outlier_pulls_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "pulls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
