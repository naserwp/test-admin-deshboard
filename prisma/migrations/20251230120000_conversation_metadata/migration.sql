-- Add metadata column for storing parsed lead info and other details
ALTER TABLE "Conversation" ADD COLUMN "metadata" JSONB;
