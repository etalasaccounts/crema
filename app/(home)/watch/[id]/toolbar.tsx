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

export function ToolbarSection({
  url,
  viewerCount = 0,
}: ToolbarSectionInterface) {
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
