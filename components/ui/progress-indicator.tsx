"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner, LoadingDots } from "@/components/ui/loading-spinner";
import { CheckCircle, XCircle, AlertTriangle, Upload, Video, Clock } from "lucide-react";

interface ProgressIndicatorProps {
  status: "idle" | "uploading" | "processing" | "completed" | "failed";
  progress?: number;
  title?: string;
  description?: string;
  showProgress?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  idle: {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  uploading: {
    icon: Upload,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  processing: {
    icon: Video,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
};

const sizeConfig = {
  sm: {
    icon: "h-4 w-4",
    container: "p-3",
    title: "text-sm font-medium",
    description: "text-xs",
  },
  md: {
    icon: "h-5 w-5",
    container: "p-4",
    title: "text-base font-medium",
    description: "text-sm",
  },
  lg: {
    icon: "h-6 w-6",
    container: "p-6",
    title: "text-lg font-semibold",
    description: "text-base",
  },
};

export function ProgressIndicator({
  status,
  progress,
  title,
  description,
  showProgress = true,
  className,
  size = "md",
}: ProgressIndicatorProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;
  const isAnimated = status === "uploading" || status === "processing";

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-200",
        config.bgColor,
        sizeStyles.container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isAnimated ? (
            <LoadingSpinner 
              size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
              className={config.color}
            />
          ) : (
            <Icon className={cn(sizeStyles.icon, config.color)} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn(sizeStyles.title, "text-foreground mb-1")}>
              {title}
            </h3>
          )}
          
          {description && (
            <p className={cn(sizeStyles.description, "text-muted-foreground mb-3")}>
              {description}
            </p>
          )}
          
          {showProgress && (status === "uploading" || status === "processing") && (
            <div className="space-y-2">
              {typeof progress === "number" ? (
                <>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% complete</span>
                    {status === "uploading" && <span>Uploading...</span>}
                    {status === "processing" && <span>Processing...</span>}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LoadingDots className="text-current" />
                  <span>
                    {status === "uploading" ? "Uploading" : "Processing"}
                    <span className="animate-pulse">...</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Specialized components for common use cases
export function UploadProgress({ 
  progress, 
  fileName, 
  size = "md" 
}: { 
  progress?: number; 
  fileName?: string; 
  size?: "sm" | "md" | "lg";
}) {
  return (
    <ProgressIndicator
      status="uploading"
      progress={progress}
      title="Uploading Video"
      description={fileName ? `Uploading ${fileName}...` : "Please wait while your video is being uploaded."}
      size={size}
    />
  );
}

export function ProcessingProgress({ 
  progress, 
  estimatedTime, 
  size = "md" 
}: { 
  progress?: number; 
  estimatedTime?: string; 
  size?: "sm" | "md" | "lg";
}) {
  return (
    <ProgressIndicator
      status="processing"
      progress={progress}
      title="Processing Video"
      description={estimatedTime ? `Estimated time: ${estimatedTime}` : "Your video is being processed and will be ready shortly."}
      size={size}
    />
  );
}

export function CompletedProgress({ 
  title = "Video Ready!", 
  description = "Your video has been processed and is ready to view.", 
  size = "md" 
}: { 
  title?: string; 
  description?: string; 
  size?: "sm" | "md" | "lg";
}) {
  return (
    <ProgressIndicator
      status="completed"
      title={title}
      description={description}
      showProgress={false}
      size={size}
    />
  );
}

export function FailedProgress({ 
  title = "Upload Failed", 
  description = "There was an error processing your video. Please try again.", 
  size = "md" 
}: { 
  title?: string; 
  description?: string; 
  size?: "sm" | "md" | "lg";
}) {
  return (
    <ProgressIndicator
      status="failed"
      title={title}
      description={description}
      showProgress={false}
      size={size}
    />
  );
}