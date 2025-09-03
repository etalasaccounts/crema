-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "dropboxAccessToken" TEXT,
ADD COLUMN     "dropboxRefreshToken" TEXT,
ADD COLUMN     "dropboxTokenExpiry" TIMESTAMP(3);
