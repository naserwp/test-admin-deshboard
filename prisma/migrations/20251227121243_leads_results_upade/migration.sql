-- AlterTable
ALTER TABLE "LeadJob" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canRequestLeads" BOOLEAN NOT NULL DEFAULT false;
