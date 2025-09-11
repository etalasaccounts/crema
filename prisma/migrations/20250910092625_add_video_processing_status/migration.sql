-- CreateEnum
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."videos" ADD COLUMN     "isProcessing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "processingStatus" "public"."ProcessingStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "videoUrl" DROP NOT NULL;
