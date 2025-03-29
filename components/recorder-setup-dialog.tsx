"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mic, Video, VideoOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface Device {
  deviceId: string;
  label: string;
}

interface RecordingSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onStartRecording: (options: RecordingOptions) => void;
  onCameraStream?: (stream: MediaStream | null) => void;
  stream?: MediaStream | null;
}

export interface RecordingOptions {
  audioDeviceId: string | null;
  audioEnabled: boolean;
  videoDeviceId: string | null;
  videoEnabled: boolean;
}

export function RecordingSetupDialog({
  open,
  onClose,
  onStartRecording,
  onCameraStream,
  stream,
}: RecordingSetupDialogProps) {
  // Available devices
  const [audioDevices, setAudioDevices] = useState<Device[]>([]);
  const [videoDevices, setVideoDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<{
    audio: boolean;
    video: boolean;
  }>({ audio: false, video: false });

  // Selected options
  const [audioDeviceId, setAudioDeviceId] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoDeviceId, setVideoDeviceId] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  // Track if the camera should be initialized (only on explicit device selection, not toggle)
  const [shouldInitCamera, setShouldInitCamera] = useState(false);

  // Stop camera stream completely
  const stopCameraStream = () => {
    // First stop all tracks in the stream to ensure the camera is fully turned off
    if (stream) {
      stream.getTracks().forEach((track) => {
        if (track.kind === "video") {
          track.stop();
        }
      });
    }

    // Then tell parent to clear its reference to the stream
    onCameraStream?.(null);
  };

  // Handle camera toggle change
  const handleVideoToggle = (enabled: boolean) => {
    setVideoEnabled(enabled);

    if (!enabled) {
      // When toggled off, immediately stop the camera
      stopCameraStream();
    } else if (permissionStatus.video && videoDeviceId) {
      // When toggled on, if we already have permissions and a device, start the camera
      setShouldInitCamera(true);
    }
  };

  const initializeCameraPreview = async (
    deviceId: string,
    showToast = false
  ) => {
    let newStream: MediaStream | null = null;
    try {
      newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Send the stream to parent for preview
      onCameraStream?.(newStream);

      // Update device list and permissions
      const devices = await navigator.mediaDevices.enumerateDevices();
      updateDeviceList(devices);
      setPermissionStatus((prev) => ({ ...prev, video: true }));

      // Only show toast when explicitly requested (when granting permissions)
      if (showToast) {
        toast.success("Camera access granted!");
      }
    } catch (err) {
      console.error("Error initializing camera:", err);

      // Ensure we stop any partial streams
      if (newStream) {
        newStream.getTracks().forEach((track) => track.stop());
      }

      // Also make sure the parent's stream is cleared
      stopCameraStream();

      toast.error("Failed to access camera. Check permissions and try again.");
      setPermissionStatus((prev) => ({ ...prev, video: false }));
    }
  };

  const requestPermissions = async (type: "audio" | "video") => {
    try {
      const constraints = {
        [type]: true,
      };

      setIsLoading(true);

      // Request permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (type === "video") {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const deviceId = videoTrack.getSettings().deviceId;
          if (deviceId) {
            setVideoDeviceId(deviceId);
            // Set flag to initialize camera after permission is granted via the button
            setShouldInitCamera(true);

            // Explicitly set the flag to initialize the camera here since this was triggered by the button
            await initializeCameraPreview(deviceId, true);
          }
        }
      } else {
        // For audio, stop the tracks as we don't need preview
        stream.getTracks().forEach((track) => track.stop());
      }

      // Get updated device list
      const devices = await navigator.mediaDevices.enumerateDevices();
      updateDeviceList(devices);

      setPermissionStatus((prev) => ({
        ...prev,
        [type]: true,
      }));

      // Only show toast for audio here - video toast is shown in initializeCameraPreview
      if (type === "audio") {
        toast.success("Microphone access granted!");
      }
    } catch (err) {
      console.error(`Error requesting ${type} permission:`, err);

      // Ensure any partial streams are stopped
      if (type === "video") {
        stopCameraStream();
      }

      toast.error(
        `Please allow ${
          type === "audio" ? "microphone" : "camera"
        } access in your browser settings`
      );
      setPermissionStatus((prev) => ({
        ...prev,
        [type]: false,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeviceList = (devices: MediaDeviceInfo[]) => {
    const audioInputs: Device[] = [];
    const videoInputs: Device[] = [];

    devices.forEach((device) => {
      if (device.label) {
        if (device.kind === "audioinput") {
          audioInputs.push({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${audioInputs.length + 1}`,
          });
        } else if (device.kind === "videoinput") {
          videoInputs.push({
            deviceId: device.deviceId,
            label: device.label || `Camera ${videoInputs.length + 1}`,
          });
        }
      }
    });

    setAudioDevices(audioInputs);
    setVideoDevices(videoInputs);

    // Set default selections
    if (audioInputs.length > 0) {
      setAudioDeviceId(audioInputs[0].deviceId);
    }
    if (videoInputs.length > 0) {
      setVideoDeviceId(videoInputs[0].deviceId);
    }
  };

  // Check if we have existing options when opening the dialog
  useEffect(() => {
    if (open) {
      setIsLoading(true);

      // Always enumerate available devices first
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          updateDeviceList(devices);

          // Check if we have permission from labeled devices
          const hasAudioPermission = devices.some(
            (device) => device.kind === "audioinput" && device.label
          );
          const hasVideoPermission = devices.some(
            (device) => device.kind === "videoinput" && device.label
          );

          setPermissionStatus({
            audio: hasAudioPermission,
            video: hasVideoPermission,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });

      // If we already have a camera stream, update the UI to reflect that
      if (stream && stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();

        if (settings.deviceId) {
          setVideoDeviceId(settings.deviceId);
          setVideoEnabled(true);
          setPermissionStatus((prev) => ({ ...prev, video: true }));
        }
      }

      // Load saved options if available
      try {
        const savedOptions = localStorage.getItem("recordingOptions");
        if (savedOptions) {
          const options = JSON.parse(savedOptions);

          // Set audio options
          if (options.audioDeviceId) {
            setAudioDeviceId(options.audioDeviceId);
            setAudioEnabled(options.audioEnabled);
          }

          // Set video options if we don't already have a stream
          if (
            options.videoDeviceId &&
            (!stream || stream.getVideoTracks().length === 0)
          ) {
            setVideoDeviceId(options.videoDeviceId);
            setVideoEnabled(options.videoEnabled);

            // Don't automatically initialize camera, just set the states
            // We'll wait for user to click the permission button if needed
          }
        }
      } catch (error) {
        console.error("Failed to load saved recording options:", error);
      }
    }
  }, [open, stream]);

  // Clear camera stream when dialog closes, but only if not about to start recording
  useEffect(() => {
    if (!open) {
      // Make sure camera is completely stopped when dialog is closed
      stopCameraStream();
    }
  }, [open]);

  // Update camera stream when video device or enabled state changes
  useEffect(() => {
    const initializeCameraIfNeeded = async () => {
      // Only initialize camera if dialog is open, video is enabled, we have a device ID,
      // AND we already have permission AND user has explicitly selected a device
      if (
        open &&
        videoEnabled &&
        videoDeviceId &&
        permissionStatus.video &&
        shouldInitCamera
      ) {
        await initializeCameraPreview(videoDeviceId, false);
        // Reset the flag after initialization
        setShouldInitCamera(false);
      } else if (!videoEnabled && open) {
        // If video is disabled, completely stop the camera stream
        stopCameraStream();
      }
    };

    initializeCameraIfNeeded();
  }, [
    videoEnabled,
    videoDeviceId,
    permissionStatus.video,
    open,
    shouldInitCamera,
  ]);

  const handleStartRecording = () => {
    // Send recording options to parent component
    onStartRecording({
      audioDeviceId,
      audioEnabled,
      videoDeviceId,
      videoEnabled,
    });

    // Don't stop camera stream here, parent component will manage it
  };

  // Create a custom device selector handler
  const handleSelectVideoDevice = (device: string) => {
    setVideoDeviceId(device);
    // Set the flag to initialize camera when a device is explicitly selected
    setShouldInitCamera(true);
  };

  const renderDeviceSelector = (type: "audio" | "video") => {
    const isAudio = type === "audio";
    const devices = isAudio ? audioDevices : videoDevices;
    const enabled = isAudio ? audioEnabled : videoEnabled;
    const deviceId = isAudio ? audioDeviceId : videoDeviceId;
    const setDeviceId = isAudio ? setAudioDeviceId : handleSelectVideoDevice;
    const hasPermission = isAudio
      ? permissionStatus.audio
      : permissionStatus.video;

    if (!enabled) return null;

    // If we don't have permission or no labeled devices are available, show the button
    if (!hasPermission || devices.length === 0) {
      return (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => requestPermissions(type)}
          disabled={isLoading}
        >
          <ShieldAlert className="w-4 h-4 mr-2" />
          {isLoading
            ? "Requesting access..."
            : `Allow ${isAudio ? "microphone" : "camera"} access`}
        </Button>
      );
    }

    return (
      <Select
        value={deviceId || ""}
        onValueChange={setDeviceId}
        disabled={isLoading || devices.length === 0}
      >
        <SelectTrigger id={`${type}-device`}>
          <SelectValue
            placeholder={`Select ${isAudio ? "microphone" : "camera"}`}
          />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      modal={false}
    >
      <DialogContent
        className="sm:max-w-[500px]"
        onPointerDownCapture={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.preventDefault()}
        style={{ pointerEvents: "auto" }}
      >
        <DialogHeader>
          <DialogTitle>Recording Setup</DialogTitle>
          <DialogDescription>
            Configure your recording options before starting.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Audio Input Selection */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="audio-device" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Microphone
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="audio-enabled"
                  checked={audioEnabled}
                  onCheckedChange={setAudioEnabled}
                />
                <Label htmlFor="audio-enabled">
                  {audioEnabled ? "On" : "Off"}
                </Label>
              </div>
            </div>

            {renderDeviceSelector("audio")}
          </div>

          {/* Video Input Selection */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="video-device" className="flex items-center gap-2">
                {videoEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
                Camera
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="video-enabled"
                  checked={videoEnabled}
                  onCheckedChange={handleVideoToggle}
                />
                <Label htmlFor="video-enabled">
                  {videoEnabled ? "On" : "Off"}
                </Label>
              </div>
            </div>

            {renderDeviceSelector("video")}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStartRecording}
            disabled={
              isLoading ||
              (audioEnabled && !audioDeviceId) ||
              (videoEnabled && !videoDeviceId)
            }
          >
            Start Recording
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
