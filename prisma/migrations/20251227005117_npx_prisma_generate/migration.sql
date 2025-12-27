-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "customPublished" TEXT,
ADD COLUMN     "humanScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "metaImageUrl" TEXT,
ADD COLUMN     "seoScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoUrl" TEXT;
