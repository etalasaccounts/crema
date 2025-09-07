"use client";

// Hooks & Next
import { useRouter } from "next/navigation";

// Components
import { Button } from "@/components/ui/button";
import { ChevronLeft, Link2, Users } from "lucide-react";
import { toast } from "sonner";

interface ToolbarSectionInterface {
  url: string;
  viewerCount?: number;
}

export function ToolbarSection({ url, viewerCount = 0 }: ToolbarSectionInterface) {
  const router = useRouter();
  return (
    <div className="flex gap-2 justify-between">
      {/* Back to home */}
      <Button
        variant={"ghost"}
        className="w-fit text-lg pl-1 rounded-2xl"
        onClick={() => {
          router.push("/home");
        }}
      >
        <ChevronLeft /> Home
      </Button>
      
      {/* Viewer count and Share */}
      <div className="flex gap-2 items-center">
        {/* Viewer count */}
        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
          <Users className="w-4 h-4" />
          <span>{viewerCount} viewer{viewerCount !== 1 ? 's' : ''}</span>
        </div>
        
        {/* Share */}
        <Button
          variant={"secondary"}
          className="rounded-full size-11 cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(url);
            toast.success("URL copied to clipboard");
          }}
        >
          <Link2 className="text-lg" />
        </Button>
      </div>
    </div>
  );
}
