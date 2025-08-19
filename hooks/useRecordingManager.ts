import { useCallback, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCountdownState,
  setRecording,
  setStandby,
} from "@/store/slices/mediaSlice";
import { useMediaRedux } from "@/hooks/use-media-redux";
import { toast } from "sonner";
import { useScreenRecording } from "@/hooks/useScreenRecording";
import { mediaStreamManager } from "@/lib/services/MediaStreamManager";
import { uploadVideoToBunny } from "@/lib/upload-video";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";

export function useRecordingManager() {
  const dispatch = useAppDispatch();
  const { isRecording, countdownState, isCountdownPaused, cameraActive } =
    useAppSelector((state) => state.media);
  const { user } = useCurrentUser();
  const router = useRouter();

  const {
    startRecording,
    stopRecording,
    resumeRecording,
    pauseRecording,
    isPaused,
  } = useScreenRecording();

  const { deactivateCamera } = useMediaRedux();

  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear countdown timeouts
  const clearCountdownTimeouts = useCallback(() => {
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
  }, []);

  // Start the recording process with countdown
  const startRecordingProcess = useCallback(async () => {
    if (isRecording) {
      console.log("Recording already in progress");
      return false;
    }

    try {
      // First, capture the screen - this will prompt user for screen selection
      let screenStream = mediaStreamManager.screenStream;
      if (!screenStream) {
        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
          });

          // Store the screen stream in the manager
          mediaStreamManager.setScreenStream(screenStream);

          // Add event listener for when user stops sharing
          screenStream.getVideoTracks()[0].addEventListener("ended", () => {
            mediaStreamManager.setScreenStream(null);
          });
        } catch (error) {
          console.error("Error capturing screen:", error);
          toast.error(
            "Screen capture was cancelled or failed. Please try again and select a screen to record."
          );
          return false;
        }
      }

      // Get microphone stream if mic is active
      const micStream = mediaStreamManager.microphoneStream;

      // Start countdown sequence: standby -> rolling -> action -> recording
      dispatch(setCountdownState("standby"));

      // Standby phase (1 second)
      countdownTimeoutRef.current = setTimeout(() => {
        dispatch(setCountdownState("rolling"));

        // Rolling phase (1 second)
        countdownTimeoutRef.current = setTimeout(() => {
          dispatch(setCountdownState("action"));

          // Action phase (1 second)
          countdownTimeoutRef.current = setTimeout(async () => {
            dispatch(setCountdownState("inactive"));
            await startActualRecording(screenStream, micStream);
          }, 1000);
        }, 1000);
      }, 1000);

      return true;
    } catch (error: unknown) {
      console.error(
        "Error starting recording process:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Error starting recording");
      dispatch(setRecording(false));
      dispatch(setCountdownState("inactive"));
      return false;
    }
  }, [isRecording, dispatch]);

  // Start actual recording without countdown
  const startActualRecording = useCallback(
    async (screenStream: MediaStream, micStream?: MediaStream | null) => {
      try {
        await startRecording(screenStream, micStream);
        dispatch(setRecording(true));
        toast.success("Recording started!");
        return true;
      } catch (error: unknown) {
        console.error(
          "Error starting actual recording:",
          error instanceof Error ? error.message : String(error)
        );
        toast.error("Error starting recording");
        dispatch(setRecording(false));
        dispatch(setCountdownState("inactive"));
        return false;
      }
    },
    [startRecording, dispatch]
  );

  // Stop recording process
  const stopRecordingProcess = useCallback(
    async (recordingDuration?: number) => {
      console.log("stopRecordingProcess called, isRecording:", isRecording);

      if (!isRecording) {
        return false;
      }

      try {
        // Stop the recording and get the blob

        const blob = await stopRecording();

        if (blob && user) {
          console.log("Recording stopped, blob size:", blob.size);
          console.log(
            "Recording duration from timer:",
            recordingDuration,
            "seconds"
          );

          // Reset recording state
          dispatch(setRecording(false));
          dispatch(setCountdownState("inactive"));
          dispatch(setStandby(false));

          // Deactivate camera to ensure it's properly stopped
          if (cameraActive) {
            deactivateCamera();
          }

          // Use the timer duration instead of extracting from blob
          const duration =
            recordingDuration && recordingDuration > 0 ? recordingDuration : 0;
          console.log("Duration being used for video creation:", duration);
          console.log(
            "Original recordingDuration parameter:",
            recordingDuration
          );

          // Show a loading toast for the upload process
          const uploadToast = toast.loading("Uploading video to Bunny CDN...");

          uploadVideoToBunny(blob)
            .then(async (videoUrl) => {
              if (videoUrl && user) {
                console.log("Video URL from Bunny:", videoUrl);
                console.log("Video duration:", duration, "seconds");
                toast.dismiss(uploadToast);

                // Create video record in database
                const createVideoToast = toast.loading(
                  "Creating video record..."
                );

                try {
                  const response = await fetch("/api/videos", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      videoUrl,
                      userId: user.id,
                      workspaceId: user.active_workspace,
                      duration: duration > 0 ? duration : undefined,
                    }),
                  });

                  const data = await response.json();

                  if (data.success && data.video) {
                    toast.dismiss(createVideoToast);
                    toast.success("Video saved successfully!");

                    // Redirect to watch page
                    router.push(`/watch/${data.video.id}`);
                  } else {
                    throw new Error(
                      data.error || "Failed to create video record"
                    );
                  }
                } catch (error) {
                  console.error("Error creating video record:", error);
                  toast.dismiss(createVideoToast);
                  toast.error("Failed to save video record");

                  // Fallback: copy URL to clipboard
                  navigator.clipboard
                    .writeText(videoUrl)
                    .then(() => {
                      toast.success(
                        "Video URL copied to clipboard as fallback!"
                      );
                    })
                    .catch(() => {
                      console.log("Could not copy to clipboard");
                    });
                }
              } else {
                // If upload failed, provide fallback to download locally
                toast.dismiss(uploadToast);
                toast.error("Failed to upload video to Bunny CDN");

                // Provide fallback to download locally
                const localUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = localUrl;
                a.download = `recording-${new Date().toISOString()}.webm`;
                document.body.appendChild(a);
                a.click();

                // Clean up
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(localUrl);
                }, 100);

                toast.success("Recording saved locally as fallback");
              }
            })
            .catch((error) => {
              toast.dismiss(uploadToast);
              console.error("Error uploading video:", error);
              toast.error("Error uploading video to Bunny CDN");

              // Fallback to local download on error
              const localUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.style.display = "none";
              a.href = localUrl;
              a.download = `recording-${new Date().toISOString()}.webm`;
              document.body.appendChild(a);
              a.click();

              // Clean up
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(localUrl);
              }, 100);

              toast.success("Recording saved locally as fallback");
            });

          return true;
        }

        // Reset state
        dispatch(setRecording(false));
        dispatch(setCountdownState("inactive"));
        dispatch(setStandby(false));
        return true;
      } catch (error: unknown) {
        console.error(
          "Error stopping recording:",
          error instanceof Error ? error.message : String(error)
        );
        toast.error("Error saving recording");

        // Reset state on error
        dispatch(setRecording(false));
        dispatch(setCountdownState("inactive"));
        dispatch(setStandby(false));
        return false;
      }
    },
    [isRecording, stopRecording, dispatch, user, router]
  );

  const togglePauseRecording = useCallback(async () => {
    if (!isRecording) {
      console.log("No recording in progress to pause/resume");
      return false;
    }

    try {
      if (isPaused) {
        await resumeRecording();
        toast.success("Recording resumed");
      } else {
        await pauseRecording();
        toast.success("Recording paused");
      }
      return true;
    } catch (error: unknown) {
      console.error(
        "Error toggling pause:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Error pausing/resuming recording");
      return false;
    }
  }, [isRecording, isPaused, resumeRecording, pauseRecording]);

  // Handle countdown pause/resume
  useEffect(() => {
    if (countdownState === "recording") {
      if (isCountdownPaused) {
        // Pause countdown
        if (countdownTimeoutRef.current) {
          clearTimeout(countdownTimeoutRef.current);
          countdownTimeoutRef.current = null;
        }
      } else {
        // Resume countdown if it was paused
        // This would need more complex logic to resume from where it left off
        // For now, we'll just clear the timeouts when paused
      }
    }
  }, [isCountdownPaused, countdownState, dispatch, clearCountdownTimeouts]);

  // Listen for screen sharing ended event
  useEffect(() => {
    const handleScreenSharingEnded = async (recordingTime?: number) => {
      if (isRecording) {
        console.log("Screen sharing ended by user, stopping recording...");
        console.log("Recording time from event:", recordingTime);
        await stopRecordingProcess(recordingTime);
      }
    };

    mediaStreamManager.on("screenSharingEnded", handleScreenSharingEnded);

    return () => {
      mediaStreamManager.removeListener(
        "screenSharingEnded",
        handleScreenSharingEnded
      );
    };
  }, [isRecording, stopRecordingProcess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCountdownTimeouts();
    };
  }, [clearCountdownTimeouts]);

  return {
    startRecordingProcess,
    startActualRecording,
    stopRecordingProcess,
    togglePauseRecording,
    clearCountdownTimeouts,
  };
}
