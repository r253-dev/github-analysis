-- CreateTable
CREATE TABLE "Commit" (
    "nodeId" TEXT NOT NULL PRIMARY KEY,
    "pullId" BIGINT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "Commit_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "pulls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
