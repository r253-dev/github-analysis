-- CreateTable
CREATE TABLE "pulls" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userLogin" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME NOT NULL,
    "mergedAt" DATETIME NOT NULL,
    "assignees" TEXT NOT NULL,
    "draft" BOOLEAN NOT NULL,
    "headRef" TEXT NOT NULL,
    "baseRef" TEXT NOT NULL,
    "repositoryId" BIGINT NOT NULL,
    CONSTRAINT "pulls_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "labels" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "nodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "nodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ownerLogin" TEXT NOT NULL,
    "description" TEXT,
    "visibility" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_LabelToPull" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,
    CONSTRAINT "_LabelToPull_A_fkey" FOREIGN KEY ("A") REFERENCES "labels" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LabelToPull_B_fkey" FOREIGN KEY ("B") REFERENCES "pulls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "labels_nodeId_key" ON "labels"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_nodeId_key" ON "repositories"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_fullName_key" ON "repositories"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "_LabelToPull_AB_unique" ON "_LabelToPull"("A", "B");

-- CreateIndex
CREATE INDEX "_LabelToPull_B_index" ON "_LabelToPull"("B");
