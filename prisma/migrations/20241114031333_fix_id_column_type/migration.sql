/*
  Warnings:

  - The primary key for the `Commit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Commit` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nodeId" TEXT NOT NULL,
    "pullId" BIGINT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "Commit_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "pulls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Commit" ("authorName", "date", "id", "message", "nodeId", "pullId", "sha") SELECT "authorName", "date", "id", "message", "nodeId", "pullId", "sha" FROM "Commit";
DROP TABLE "Commit";
ALTER TABLE "new_Commit" RENAME TO "Commit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
