-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pulls" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userLogin" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "mergedAt" DATETIME,
    "assignees" TEXT NOT NULL,
    "draft" BOOLEAN NOT NULL,
    "headRef" TEXT NOT NULL,
    "baseRef" TEXT NOT NULL,
    "repositoryId" BIGINT NOT NULL,
    CONSTRAINT "pulls_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_pulls" ("assignees", "baseRef", "closedAt", "createdAt", "draft", "headRef", "id", "mergedAt", "number", "repositoryId", "state", "title", "updatedAt", "userLogin") SELECT "assignees", "baseRef", "closedAt", "createdAt", "draft", "headRef", "id", "mergedAt", "number", "repositoryId", "state", "title", "updatedAt", "userLogin" FROM "pulls";
DROP TABLE "pulls";
ALTER TABLE "new_pulls" RENAME TO "pulls";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
