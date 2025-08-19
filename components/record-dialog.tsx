"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedAudioDevice,
  setSelectedVideoDevice,
  setStandby,
} from "@/store/slices/mediaSlice";
import { useMediaRedux } from "@/hooks/use-media-redux";
import { useRecordingManager } from "@/hooks/useRecordingManager";

interface RecordDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onStartRecording?: () => void;
}

export function RecordDialog({
  isOpen,
  setIsOpen,
  onStartRecording,
}: RecordDialogProps) {
  const dispatch = useAppDispatch();
  const {
    micPermission,
    cameraPermission,
    micActive,
    cameraActive,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    isStandby,
    isRecording,
    selectedVideoDevice,
  } = useAppSelector((state) => state.media);

  const { startRecordingProcess } = useRecordingManager();

  const {
    checkPermissions,
    requestMicrophonePermission,
    requestCameraPermission,
    loadAudioDevices,
    loadVideoDevices,
    activateMicrophone,
    activateCamera,
    deactivateMicrophone,
    deactivateCamera,
  } = useMediaRedux({ onDialogOpen: isOpen });

  // Handle manual close only through dedicated UI controls
  const handleOpenChange = (open: boolean) => {
    // Only allow closing, not opening (opening is handled by the button)
    if (!open) {
      // Clean up active devices before closing
      if (micActive) {
        deactivateMicrophone();
      }

      if (cameraActive) {
        deactivateCamera();
      }

      setIsOpen(false); // Exit standby mode when dialog closes
      dispatch(setStandby(false));
    }
  };

  // Start recording and close dialog
  const handleStartRecord = async () => {
    // Only call the callback passed from parent (which will handle the recording process)
    // This prevents double calling of startRecordingProcess
    if (onStartRecording) {
      await onStartRecording();
    }
  };

  // Toggle microphone on/off
  const toggleMicrophone = async () => {
    if (micActive) {
      deactivateMicrophone();
    } else if (micPermission === "granted") {
      await activateMicrophone(selectedAudioDevice || undefined);
    }
  };

  // Toggle camera on/off
  const toggleCamera = async () => {
    if (cameraActive) {
      deactivateCamera();
    } else if (cameraPermission === "granted") {
      await activateCamera(selectedVideoDevice || undefined);
    }
  };

  // Handle audio device selection
  const handleSelectAudioDevice = (deviceId: string) => {
    console.log("Selected audio device:", deviceId);
    dispatch(setSelectedAudioDevice(deviceId));
    if (micActive) {
      activateMicrophone(deviceId);
    }
  };

  // Handle video device selection
  const handleSelectVideoDevice = (deviceId: string) => {
    console.log("Selected video device:", deviceId);
    dispatch(setSelectedVideoDevice(deviceId));
    if (cameraActive) {
      activateCamera(deviceId);
    }
  };

  // Check if an element is part of the record controls
  const isRecordControlElement = (element: HTMLElement | null): boolean => {
    if (!element) return false;

    // Check if it's the drag-handle class or any parent has it
    if (element.closest(".drag-handle")) return true;

    // Check if it's inside the record controls container (by z-index or other identifiable traits)
    if (element.closest(".z-\\[250\\]")) return true;

    // Check specifically for the video element or camera preview
    if (element.tagName === "VIDEO" || element.closest(".rounded-full"))
      return true;

    return false;
  };

  // Request permissions and load devices when dialog opens
  useEffect(() => {
    if (isOpen) {
      const initializeDevices = async () => {
        console.log("Initializing devices on dialog open");

        // First check current permissions
        await checkPermissions();

        // Request permissions if needed
        if (micPermission !== "granted") {
          await requestMicrophonePermission();
        }

        if (cameraPermission !== "granted") {
          await requestCameraPermission();
        }

        // Refresh device lists regardless of whether we just requested permissions
        if (micPermission === "granted") {
          await loadAudioDevices();
        }

        if (cameraPermission === "granted") {
          await loadVideoDevices();
        }
      };

      initializeDevices();
    }
  }, [isOpen]);

  // Debug device lists
  useEffect(() => {
    if (isOpen) {
      console.log("Audio devices in component:", audioDevices);
      console.log("Selected audio device:", selectedAudioDevice);
    }
  }, [audioDevices, selectedAudioDevice, isOpen]);

  useEffect(() => {
    if (isOpen) {
      console.log("Video devices in component:", videoDevices);
      console.log("Selected video device:", selectedVideoDevice);
    }
  }, [videoDevices, selectedVideoDevice, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay
          className="z-[49] bg-white/50"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (isRecordControlElement(target)) {
              e.stopPropagation();
            }
          }}
        />

        <DialogContent
          className="sm:max-w-80 fixed left-4 top-4 translate-x-0 translate-y-0 z-[50]"
          onPointerDownOutside={(e) => {
            // Prevent closing the dialog when clicking on any record control elements
            const target = e.target as HTMLElement;
            if (isRecordControlElement(target)) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-3xl">crema</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Microphone Section */}
            <div className="flex flex-row gap-2 items-center">
              <div className="w-full">
                <Select
                  value={selectedAudioDevice || undefined}
                  onValueChange={handleSelectAudioDevice}
                  disabled={micPermission !== "granted"}
                >
                  <SelectTrigger className="w-full bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white border-0 px-4 rounded-lg h-10 text-start">
                    <SelectValue
                      placeholder={
                        micPermission === "granted"
                          ? "Select microphone"
                          : "No access"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {audioDevices.length > 0 ? (
                        audioDevices.map((device) => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                          >
                            {device.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-devices" disabled>
                          No microphones found
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle Button */}
              <Button
                type="button"
                variant="outline"
                className={`rounded-full size-10 border-0 ${
                  micPermission === "granted"
                    ? micActive
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-white opacity-50"
                }`}
                onClick={toggleMicrophone}
                disabled={micPermission !== "granted"}
              >
                {micActive ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Camera Section */}
            <div className="flex flex-row gap-2 items-center">
              <div className="w-full">
                <Select
                  value={selectedVideoDevice || undefined}
                  onValueChange={handleSelectVideoDevice}
                  disabled={cameraPermission !== "granted"}
                >
                  <SelectTrigger className="w-full bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white border-0 px-4 rounded-lg h-10 text-start">
                    <SelectValue
                      placeholder={
                        cameraPermission === "granted"
                          ? "Select camera"
                          : "No access"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {videoDevices.length > 0 ? (
                        videoDevices.map((device) => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                            className="text-start"
                          >
                            {device.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-devices" disabled>
                          No cameras found
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle Button */}
              <Button
                type="button"
                variant="outline"
                className={`rounded-full w-10 h-10 border-0 ${
                  cameraPermission === "granted"
                    ? cameraActive
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-white opacity-50"
                }`}
                onClick={toggleCamera}
                disabled={cameraPermission !== "granted"}
              >
                {cameraActive ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant={"secondary"}
              className="w-full text-lg rounded-xl"
              onClick={handleStartRecord}
            >
              Start Record
            </Button>
          </div>
        </DialogContent>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
