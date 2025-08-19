import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 flex flex-col rounded-3xl">
            {/* Video thumbnail skeleton */}
            <Skeleton className="aspect-video rounded-2xl mb-4" />
            
            <div className="gap-1 w-full">
              {/* Title and views skeleton */}
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
              
              {/* User info skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}