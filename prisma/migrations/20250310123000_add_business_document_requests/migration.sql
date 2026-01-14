-- CreateEnum
CREATE TYPE "BusinessDocumentRequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CLOSED');

-- CreateTable
CREATE TABLE "BusinessDocumentRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "docType" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "state" TEXT,
    "notes" TEXT NOT NULL,
    "status" "BusinessDocumentRequestStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessDocumentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessDocumentRequest_status_createdAt_idx" ON "BusinessDocumentRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "BusinessDocumentRequest" ADD CONSTRAINT "BusinessDocumentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
