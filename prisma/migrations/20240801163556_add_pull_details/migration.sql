-- CreateTable
CREATE TABLE "pull_details" (
    "pullId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "body" TEXT NOT NULL,
    "merged" BOOLEAN NOT NULL,
    "comments" INTEGER NOT NULL,
    "reviewComments" INTEGER NOT NULL,
    "commits" INTEGER NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changedFiles" INTEGER NOT NULL,
    CONSTRAINT "pull_details_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "pulls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
