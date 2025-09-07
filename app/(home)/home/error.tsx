"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error() {
  return (
    <div className="container">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          We encountered an error while loading the videos. This might be a
          temporary issue.
        </p>
      </div>
    </div>
  );
}
