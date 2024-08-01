-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pull_details" (
    "pullId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "body" TEXT,
    "merged" BOOLEAN NOT NULL,
    "comments" INTEGER NOT NULL,
    "reviewComments" INTEGER NOT NULL,
    "commits" INTEGER NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changedFiles" INTEGER NOT NULL,
    CONSTRAINT "pull_details_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "pulls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_pull_details" ("additions", "body", "changedFiles", "comments", "commits", "deletions", "merged", "pullId", "reviewComments") SELECT "additions", "body", "changedFiles", "comments", "commits", "deletions", "merged", "pullId", "reviewComments" FROM "pull_details";
DROP TABLE "pull_details";
ALTER TABLE "new_pull_details" RENAME TO "pull_details";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
