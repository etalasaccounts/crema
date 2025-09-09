"use client";

import { useState } from "react";
import { useDeleteVideo } from "@/hooks/use-videos";

// Components
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
import { Ellipsis, Trash2, Link2, Loader } from "lucide-react";

import { toast } from "sonner";
import { Video } from "@/interfaces/videos";

interface VideoListActionsProps {
  video: Video;
}

export function VideoListActions({ video }: VideoListActionsProps) {
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
    deleteVideoMutation.mutate(video.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
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
              <Trash2 className="h-4 w-4" /> Delete video
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-foreground text-neutral-100 border border-neutral-800">
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete &apos;{video.title}&apos;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteVideoMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteVideoMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin [animation-duration:600ms]" />
                  Deleting...
                </>
              ) : (
                "Delete video"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
