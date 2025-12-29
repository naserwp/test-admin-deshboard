/*
  Warnings:

  - Added the required column `updatedAt` to the `LeadResult` table without a default value. This is not possible if the table is not empty.
  - Made the column `source` on table `LeadResult` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "LeadJobStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "LeadJob" ADD COLUMN     "businessSize" TEXT,
ALTER COLUMN "status" SET DEFAULT 'QUEUED';

-- AlterTable
ALTER TABLE "LeadResult" ADD COLUMN     "businessCapital" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactFirstName" TEXT,
ADD COLUMN     "contactLastName" TEXT,
ADD COLUMN     "contactRole" TEXT,
ADD COLUMN     "ein" TEXT,
ADD COLUMN     "employeeCount" INTEGER,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "postcode" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "source" SET NOT NULL;

-- CreateTable
CREATE TABLE "LeadAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadAudit_userId_createdAt_idx" ON "LeadAudit"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadAudit_jobId_createdAt_idx" ON "LeadAudit"("jobId", "createdAt");

-- AddForeignKey
ALTER TABLE "LeadAudit" ADD CONSTRAINT "LeadAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAudit" ADD CONSTRAINT "LeadAudit_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LeadJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
