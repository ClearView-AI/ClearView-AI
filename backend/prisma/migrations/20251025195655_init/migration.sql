-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CsvFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "headersJson" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "sampleJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CsvFile_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VizMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "csvFileId" TEXT NOT NULL,
    "targetScreen" TEXT NOT NULL,
    "fieldMapJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VizMapping_csvFileId_fkey" FOREIGN KEY ("csvFileId") REFERENCES "CsvFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
