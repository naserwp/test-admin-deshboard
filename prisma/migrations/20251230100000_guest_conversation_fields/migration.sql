-- Add guest visitor fields to Conversation
ALTER TABLE "Conversation"
ADD COLUMN "visitorName" TEXT,
ADD COLUMN "visitorEmail" TEXT,
ADD COLUMN "visitorPhone" TEXT;
