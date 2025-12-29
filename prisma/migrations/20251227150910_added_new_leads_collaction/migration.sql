-- AlterTable
ALTER TABLE "LeadJob" ADD COLUMN     "safeMode" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LeadAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "action" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadAuditLog_userId_createdAt_idx" ON "LeadAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadAuditLog_jobId_createdAt_idx" ON "LeadAuditLog"("jobId", "createdAt");

-- AddForeignKey
ALTER TABLE "LeadAuditLog" ADD CONSTRAINT "LeadAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAuditLog" ADD CONSTRAINT "LeadAuditLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LeadJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
