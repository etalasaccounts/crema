-- CreateTable
CREATE TABLE "video_views" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_views_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "video_views" ADD CONSTRAINT "video_views_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_views" ADD CONSTRAINT "video_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "video_views_videoId_userId_sessionId_key" ON "video_views"("videoId", "userId", "sessionId");

-- CreateIndex
CREATE INDEX "video_views_videoId_viewedAt_idx" ON "video_views"("videoId", "viewedAt");

-- AlterTable
ALTER TABLE "users" ADD COLUMN "videoViews" TEXT[];

-- AlterTable
ALTER TABLE "videos" DROP COLUMN "views";