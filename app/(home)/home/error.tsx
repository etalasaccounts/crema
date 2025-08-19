"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Video list error:", error);
  }, [error]);

  return (
    <div className="container">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          We encountered an error while loading the videos. This might be a temporary issue.
        </p>
        <div className="flex gap-4">
          <Button onClick={reset} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Refresh page
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto max-w-md">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}