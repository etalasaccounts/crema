"use client";

import { useWorkspace } from "@/hooks/use-workspace";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Video } from "lucide-react";
import { useRouter } from "next/navigation";

const FREE_VIDEO_LIMIT = 25;

export function VideoProgressBar() {
  const { data: workspace, isLoading, error } = useWorkspace();
  const router = useRouter();

  // Debug information - temporarily show what's happening
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            Loading workspace data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="text-sm text-red-500">Error: {error.message}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Please make sure you're logged in
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workspace) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            No workspace data available
          </div>
        </CardContent>
      </Card>
    );
  }

  if (workspace.isPremium) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            Premium user - progress bar hidden
          </div>
        </CardContent>
      </Card>
    );
  }

  const videoCount = workspace.videoCount;
  const progressPercentage = Math.min(
    (videoCount / FREE_VIDEO_LIMIT) * 100,
    100
  );
  const isNearLimit = videoCount >= FREE_VIDEO_LIMIT * 0.8; // 80% of limit
  const isAtLimit = videoCount >= FREE_VIDEO_LIMIT;

  const handleUpgrade = () => {
    router.push("/billing");
  };

  return (
    <Card className="mb-6 bg-secondary border-none rounded-3xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            {videoCount} / {FREE_VIDEO_LIMIT} Videos
          </div>
        </div>

        <Progress
          value={progressPercentage}
          className={`bg-muted-foreground/10 h-2 mb-3 ${
            isAtLimit
              ? "[&>div]:bg-red-500"
              : isNearLimit
              ? "[&>div]:bg-yellow-500"
              : "[&>div]:bg-blue-500"
          }`}
        />

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {isAtLimit
              ? "Video limit reached"
              : isNearLimit
              ? "Approaching video limit"
              : `${FREE_VIDEO_LIMIT - videoCount} videos remaining`}
          </div>

          {(isNearLimit || isAtLimit) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpgrade}
              className="h-7 px-3 text-xs"
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>

        {isAtLimit && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">
              You've reached your free video limit. Upgrade to Premium for
              unlimited videos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
