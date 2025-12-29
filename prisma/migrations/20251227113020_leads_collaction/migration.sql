-- CreateEnum
CREATE TYPE "LeadJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "LeadJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "context" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "leadsTarget" INTEGER NOT NULL,
    "status" "LeadJobStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadResult" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "confidence" DOUBLE PRECISION,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadJob_userId_createdAt_idx" ON "LeadJob"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadResult_jobId_createdAt_idx" ON "LeadResult"("jobId", "createdAt");

-- AddForeignKey
ALTER TABLE "LeadJob" ADD CONSTRAINT "LeadJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadResult" ADD CONSTRAINT "LeadResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LeadJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
