-- CreateEnum
CREATE TYPE "public"."Source" AS ENUM ('Dropbox', 'Local');

-- AlterTable
ALTER TABLE "public"."videos" ADD COLUMN     "source" "public"."Source";
