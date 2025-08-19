"use client";

import { Button } from "./ui/button";
import { RecordDialog } from "./record-dialog";
import { PlusIcon } from "lucide-react";
import { CountdownOverlay } from "./countdown-overlay";
import { RecordControls } from "./record-controls";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStandby, clearMediaState } from "@/store/slices/mediaSlice";
import { useRecordingManager } from "@/hooks/useRecordingManager";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function RecordButton() {
  const dispatch = useAppDispatch();
  const { isStandby, isRecording, countdownState } = useAppSelector(
    (state) => state.media
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use the recording manager
  const { startRecordingProcess } = useRecordingManager();

  // Start standby mode
  const handleStartStandby = () => {
    dispatch(setStandby(true));
  };

  // Exit standby mode and cleanup
  const handleExitStandby = () => {
    // Clean up media streams in the manager
    import("@/lib/services/MediaStreamManager").then(
      ({ mediaStreamManager }) => {
        mediaStreamManager.clearAllStreams();
      }
    );

    // Clear Redux state
    dispatch(clearMediaState());
  };

  // Proxy to the recording manager's start recording function
  const handleStartRecording = async () => {
    await startRecordingProcess();
  };

  // Only show dialog when in standby and not already in recording process
  const showDialog = isStandby && countdownState === "inactive" && !isRecording;

  return (
    <>
      <Button
        className="text-base rounded-full size-10"
        onClick={handleStartStandby}
      >
        <PlusIcon />
      </Button>

      {/* Show the countdown overlay */}
      <CountdownOverlay />

      {/* Show controls when in standby or recording mode */}
      {isMounted &&
        (isStandby || isRecording) &&
        createPortal(
          <div className="fixed inset-0 z-[60] pointer-events-none">
            <div className="pointer-events-auto">
              <RecordControls />
            </div>
          </div>,
          document.body
        )}

      <RecordDialog
        isOpen={showDialog}
        setIsOpen={(open) => {
          if (!open) handleExitStandby();
        }}
        onStartRecording={handleStartRecording}
      />
    </>
  );
}
