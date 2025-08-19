import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-5">
      {/* Toolbar Skeleton */}
      <Skeleton className="h-12 w-full" />
      {/* Video Player Skeleton */}
      <Skeleton className="aspect-video w-full rounded-xl" />
      {/* Title Skeleton */}
      <div className="flex flex-row justify-between gap-4">
        <div className="flex flex-col flex-1 gap-3">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-3 items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}