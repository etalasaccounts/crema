"use client";

import React, { useState, useRef, useEffect } from "react";
import { Square, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  RecordingSetupDialog,
  RecordingOptions,
} from "@/components/recorder-setup-dialog";
import { createClient } from "@/lib/supabase/client-browser";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { AuroraText } from "@/components/magicui/aurora-text";
import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

import { RecorderController } from "@/components/recorder-controller";

// Create a reusable recording manager hook
function useRecordingManager() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isSelectingScreen, setIsSelectingScreen] = useState(false);
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  // Recording state refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Options
  const [recordingOptions, setRecordingOptions] =
    useState<RecordingOptions | null>(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);

  // Load saved options from localStorage on mount
  useEffect(() => {
    try {
      const savedOptions = localStorage.getItem("recordingOptions");
      if (savedOptions) {
        setRecordingOptions(JSON.parse(savedOptions));
      }
    } catch (error) {
      console.error("Failed to load recording options:", error);
    }
  }, []);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopAllStreams();
    };
  }, []);

  // Ensure camera stays on during recording if enabled in options
  useEffect(() => {
    // If recording is active and camera should be on (according to options)
    // but camera stream is not available, try to restart it
    if (
      isRecording &&
      recordingOptions?.videoEnabled &&
      recordingOptions?.videoDeviceId &&
      (!cameraStream || cameraStream.getVideoTracks().length === 0)
    ) {
      console.log(
        "Camera should be on during recording but isn't - restarting camera"
      );
      startCameraStream(recordingOptions.videoDeviceId).catch((err) => {
        console.error("Failed to restart camera during recording:", err);
      });
    }
  }, [isRecording, recordingOptions, cameraStream]);

  // Save options to localStorage
  const saveOptions = (options: RecordingOptions) => {
    localStorage.setItem("recordingOptions", JSON.stringify(options));
    setRecordingOptions(options);
  };

  // Start the camera stream
  const startCameraStream = async (deviceId: string | null) => {
    if (!deviceId) return null;

    try {
      console.log("Starting camera stream with device ID:", deviceId);

      // Stop any existing camera stream first
      if (cameraStream) {
        console.log("Stopping existing camera stream");
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      // Create new camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log(
        "Camera stream started successfully:",
        stream.getVideoTracks().map((t) => ({
          enabled: t.enabled,
          id: t.id,
          label: t.label,
        }))
      );

      setCameraStream(stream);
      return stream;
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Failed to access camera. Check permissions and try again.");
      return null;
    }
  };

  // Open setup dialog
  const openSetupDialog = () => {
    setSetupDialogOpen(true);
  };

  // Close setup dialog
  const closeSetupDialog = () => {
    setSetupDialogOpen(false);
  };

  // Handle setup completion
  const handleSetupComplete = async (options: RecordingOptions) => {
    saveOptions(options);

    // Start camera stream if needed - this should be done BEFORE starting recording
    if (options.videoEnabled && options.videoDeviceId) {
      await startCameraStream(options.videoDeviceId);
    } else {
      // Make sure camera is stopped if user disabled it
      stopCamera();
    }

    // Start recording will handle closing the setup dialog after screen selection
    const recordingStarted = await startRecording(options);

    // Only close the dialog if recording started successfully
    if (recordingStarted) {
      setSetupDialogOpen(false);
    }
  };

  // Stop all media streams
  const stopAllStreams = () => {
    // Stop screen stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    // Stop recording timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start recording
  const startRecording = async (options: RecordingOptions) => {
    try {
      // Reset recording state
      setRecordingTime(0);

      // Set selecting screen state to true to keep components mounted
      setIsSelectingScreen(true);

      // Get screen capture stream
      let screenStream: MediaStream;
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            displaySurface: "monitor",
          },
          audio: false,
          selfBrowserSurface: "exclude",
        } as any);
      } catch (error) {
        // User canceled screen selection
        console.error("Screen selection canceled:", error);
        setIsSelectingScreen(false);
        toast.error("Screen selection canceled. Please try again.");
        return false;
      }

      // Screen selection completed
      setIsSelectingScreen(false);

      screenStreamRef.current = screenStream;

      // Add screen capture ended event listener
      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        // If the user stops sharing the screen, stop the recording
        if (isRecording) {
          stopRecording();
        }
      });

      // Collect tracks for recording
      const recordingTracks: MediaStreamTrack[] = [...screenStream.getTracks()];

      // Add audio if enabled
      if (options.audioEnabled && options.audioDeviceId) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: { exact: options.audioDeviceId },
            },
          });

          audioStreamRef.current = audioStream;
          recordingTracks.push(...audioStream.getAudioTracks());
        } catch (error) {
          console.error("Error accessing audio:", error);
          toast.error(
            "Failed to access microphone. Check permissions and try again."
          );
          screenStream.getTracks().forEach((track) => track.stop());
          return false;
        }
      }

      // Note: We DON'T touch the camera stream here - it's managed separately
      // and maintained regardless of recording state

      // Create combined stream for recording (screen + audio, not camera)
      const combinedStream = new MediaStream(recordingTracks);

      // Create media recorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        try {
          setIsCreatingRecord(true);

          // Generate a title with the current date
          const now = new Date();
          const formattedDate = now.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const autoTitle = `Replay - ${formattedDate}`;

          // Create a new record in Supabase
          const supabase = createClient();
          const { data: videoRecord, error } = await supabase
            .from("videos")
            .insert([{ video_url: null, title: autoTitle }])
            .select()
            .single();

          if (error) {
            throw new Error("Failed to create video record");
          }

          // Create blob from chunks
          const blob = new Blob(chunksRef.current, { type: "video/webm" });

          // Convert blob to base64 for storage in sessionStorage
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            const base64data = reader.result as string;
            // Remove the data:video/webm;base64, prefix
            const base64Content = base64data.split(",")[1];

            // Store recording data in sessionStorage
            sessionStorage.setItem(
              "recordingData",
              JSON.stringify({
                blobBase64: base64Content,
                timestamp: new Date().toISOString(),
              })
            );

            // Redirect to the preview page with the ID
            window.location.href = `/preview/${videoRecord.id}`;
          };
        } catch (error) {
          console.error("Error creating video record:", error);
          toast.error("Failed to save recording. Please try again.");
          setIsCreatingRecord(false);
        } finally {
          // Clean up recording streams (not camera)
          stopAllStreams();
        }
      };

      // Start recording
      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please ensure you've granted necessary permissions."
      );
      return false;
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsCreatingRecord(true);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      // Stop camera when recording ends
      // This ensures the camera is turned off after recording
      stopCamera();

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Note: Redirection will happen in the mediaRecorder.onstop handler
    }
  };

  // Restart recording
  const restartRecording = () => {
    stopRecording();
    setRecordingTime(0);

    if (recordingOptions) {
      startRecording(recordingOptions);
    } else {
      openSetupDialog();
    }
  };

  // Delete recording
  const deleteRecording = () => {
    stopRecording();
    setRecordingTime(0);
    stopAllStreams();
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  return {
    // State
    isRecording,
    isPaused,
    recordingTime,
    cameraStream,
    setupDialogOpen,
    isSelectingScreen,
    isCreatingRecord,

    // Actions
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    restartRecording,
    deleteRecording,
    openSetupDialog,
    closeSetupDialog,
    handleSetupComplete,
    setCameraStream,
    stopCamera,

    // Options
    recordingOptions,
  };
}

export default function LandingPage() {
  const {
    isRecording,
    isPaused,
    recordingTime,
    cameraStream,
    setupDialogOpen,
    isSelectingScreen,
    isCreatingRecord,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    restartRecording,
    deleteRecording,
    openSetupDialog,
    closeSetupDialog,
    handleSetupComplete,
    setCameraStream,
    recordingOptions,
  } = useRecordingManager();

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Recording Setup Dialog */}
      <RecordingSetupDialog
        open={setupDialogOpen}
        onClose={closeSetupDialog}
        onStartRecording={handleSetupComplete}
        onCameraStream={setCameraStream}
        stream={cameraStream}
      />

      {/* Recording Controller */}
      {(setupDialogOpen || isRecording || isSelectingScreen) && (
        <RecorderController
          stream={cameraStream}
          onStopRecording={stopRecording}
          onPauseRecording={pauseRecording}
          onResumeRecording={resumeRecording}
          onRestartRecording={restartRecording}
          onDeleteRecording={deleteRecording}
          recordingTime={recordingTime}
          isPaused={isPaused}
          isRecording={isRecording}
        />
      )}

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-20 text-center space-y-10">
        <div className="space-y-6 max-w-3xl">
          <div className="group relative mx-auto w-fit flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] ">
            <span
              className={cn(
                "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
              )}
              style={{
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "destination-out",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "subtract",
                WebkitClipPath: "padding-box",
              }}
            />
            ☝🏻 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
            <AnimatedGradientText className="text-sm font-medium">
              Vote us in Product Hunt
            </AnimatedGradientText>
            <ChevronRight
              className="ml-1 size-4 stroke-neutral-500 transition-transform
 duration-300 ease-in-out group-hover:translate-x-0.5"
            />
          </div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight">
            <AuroraText>Record</AuroraText>, and<br></br>
            Don't Just Tell{" "}
          </h1>
          <p className="text-xl text-subtle-foreground">
            Easily record and share your screen with your teammates, for free.
          </p>

          <RainbowButton
            onClick={isRecording ? stopRecording : openSetupDialog}
            className="gap-1 w-fit"
          >
            {isRecording ? (
              <>
                <Square fill="red" strokeWidth={0} />
                <p className="text-xl">{formatTime(recordingTime)}</p>
              </>
            ) : (
              <p className="text-xl">Start Recording</p>
            )}
          </RainbowButton>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Gaffer. All rights reserved.</p>
      </footer>
    </div>
  );
}
