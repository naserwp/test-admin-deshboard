-- CreateEnum
CREATE TYPE "TalkToSalesStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "TalkToSalesLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "message" TEXT NOT NULL,
    "status" "TalkToSalesStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalkToSalesLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalkToSalesLead_status_createdAt_idx" ON "TalkToSalesLead"("status", "createdAt");
