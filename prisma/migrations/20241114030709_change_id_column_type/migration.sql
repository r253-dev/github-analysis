/*
  Warnings:

  - The primary key for the `Commit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Commit` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `pullId` on the `Commit` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `A` on the `_LabelToPull` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `B` on the `_LabelToPull` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `labels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `labels` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `outlier_pulls` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `pullId` on the `outlier_pulls` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `pull_details` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `pullId` on the `pull_details` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `pulls` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `pulls` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `repositoryId` on the `pulls` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `repositories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `repositories` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commit" (
    "id" BIGINT NOT NULL PRIMARY KEY,
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
CREATE TABLE "new__LabelToPull" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,
    CONSTRAINT "_LabelToPull_A_fkey" FOREIGN KEY ("A") REFERENCES "labels" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LabelToPull_B_fkey" FOREIGN KEY ("B") REFERENCES "pulls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__LabelToPull" ("A", "B") SELECT "A", "B" FROM "_LabelToPull";
DROP TABLE "_LabelToPull";
ALTER TABLE "new__LabelToPull" RENAME TO "_LabelToPull";
CREATE UNIQUE INDEX "_LabelToPull_AB_unique" ON "_LabelToPull"("A", "B");
CREATE INDEX "_LabelToPull_B_index" ON "_LabelToPull"("B");
CREATE TABLE "new_labels" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "nodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_labels" ("description", "id", "name", "nodeId") SELECT "description", "id", "name", "nodeId" FROM "labels";
DROP TABLE "labels";
ALTER TABLE "new_labels" RENAME TO "labels";
CREATE UNIQUE INDEX "labels_nodeId_key" ON "labels"("nodeId");
CREATE TABLE "new_outlier_pulls" (
    "pullId" BIGINT NOT NULL PRIMARY KEY,
    CONSTRAINT "outlier_pulls_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "pulls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_outlier_pulls" ("pullId") SELECT "pullId" FROM "outlier_pulls";
DROP TABLE "outlier_pulls";
ALTER TABLE "new_outlier_pulls" RENAME TO "outlier_pulls";
CREATE TABLE "new_pull_details" (
    "pullId" BIGINT NOT NULL PRIMARY KEY,
    "body" TEXT,
    "merged" BOOLEAN NOT NULL,
    "comments" INTEGER NOT NULL,
    "reviewComments" INTEGER NOT NULL,
    "commits" INTEGER NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changedFiles" INTEGER NOT NULL,
    "openedAt" DATETIME,
    CONSTRAINT "pull_details_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "pulls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_pull_details" ("additions", "body", "changedFiles", "comments", "commits", "deletions", "merged", "openedAt", "pullId", "reviewComments") SELECT "additions", "body", "changedFiles", "comments", "commits", "deletions", "merged", "openedAt", "pullId", "reviewComments" FROM "pull_details";
DROP TABLE "pull_details";
ALTER TABLE "new_pull_details" RENAME TO "pull_details";
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
CREATE TABLE "new_repositories" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "nodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ownerLogin" TEXT NOT NULL,
    "description" TEXT,
    "visibility" TEXT NOT NULL
);
INSERT INTO "new_repositories" ("description", "fullName", "id", "name", "nodeId", "ownerLogin", "visibility") SELECT "description", "fullName", "id", "name", "nodeId", "ownerLogin", "visibility" FROM "repositories";
DROP TABLE "repositories";
ALTER TABLE "new_repositories" RENAME TO "repositories";
CREATE UNIQUE INDEX "repositories_nodeId_key" ON "repositories"("nodeId");
CREATE UNIQUE INDEX "repositories_fullName_key" ON "repositories"("fullName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
