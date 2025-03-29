"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, FileIcon, ExternalLink } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded: (count: number) => void;
}

export function UploadModal({
  isOpen,
  onClose,
  onFilesUploaded,
}: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    onFilesUploaded(files.length);
    onClose();
  };

  const handlePreview = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div className="py-4 ">
          <div
            {...getRootProps()}
            className={`text-muted-foreground border border-dashed rounded-lg p-6 cursor-pointer text-center ${
              isDragActive ? "border-primary" : "border-muted-foreground"
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drop some files here, or click to select files</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-muted p-3 rounded-lg"
              >
                <div
                  onClick={() => handlePreview(file)}
                  className="flex items-center space-x-2"
                >
                  <FileIcon className="h-4 w-4" />
                  <span className="truncate text-sm cursor-pointer hover:underline">
                    {file.name}
                  </span>
                </div>

                <X
                  className="h-4 w-4"
                  onClick={() => handleRemoveFile(index)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} size={"sm"}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
