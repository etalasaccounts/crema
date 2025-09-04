"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ellipsis, Trash2, Link2 } from "lucide-react";
import { useDeleteVideo } from "@/hooks/use-delete-video";
import { useState } from "react";
import { toast } from "sonner";

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  workspace: {
    id: string;
    name: string;
  };
}

interface VideoActionsProps {
  video: VideoData;
}

export function VideoActions({ video }: VideoActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteVideoMutation = useDeleteVideo();

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const videoUrl = `${window.location.origin}/watch/${video.id}`;

    try {
      await navigator.clipboard.writeText(videoUrl);
      toast("Video URL copied to clipboard");
    } catch (error) {
      toast("Failed to copy URL to clipboard");
    }

    setIsOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    deleteVideoMutation.mutate(video.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <Ellipsis />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-48 p-2 bg-background rounded-xl"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="text-neutral-100 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start px-2 hover:bg-white/10 hover:text-neutral-100"
              onClick={handleCopyUrl}
            >
              <Link2 className="h-4 w-4" />
              Copy video URL
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 hover:bg-white/10 hover:text-neutral-100"
              onClick={handleDeleteClick}
              disabled={deleteVideoMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete video"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-foreground text-neutral-100 border border-neutral-800">
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete "{video.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-neutral-700 text-neutral-100 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteVideoMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
