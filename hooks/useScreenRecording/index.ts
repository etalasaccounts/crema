import { useState, useRef, useCallback } from 'react';

interface ScreenRecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
}

interface UseScreenRecordingReturn {
  startRecording: (screenStream: MediaStream, microphoneStream?: MediaStream | null) => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  resumeRecording: () => void;
  pauseRecording: () => void;
  isRecording: boolean;
  isPaused: boolean;
  recordedBlob: Blob | null;
}

export function useScreenRecording({
  mimeType = 'video/webm;codecs=vp9',
  videoBitsPerSecond = 2500000
}: ScreenRecordingOptions = {}): UseScreenRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // Start recording
  const startRecording = useCallback(async (screenStream: MediaStream, microphoneStream?: MediaStream | null) => {
    try {
      // Combine streams if microphone is available
      let combinedStream = screenStream;
      
      if (microphoneStream) {
        // Create a new MediaStream with both video and audio tracks
        combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...microphoneStream.getAudioTracks()
        ]);
      }
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond
      });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      
      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log('Recording stopped');
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [mimeType, videoBitsPerSecond]);
  
  // Stop recording
  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }
      
      // Handle stop event
      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(recordedChunksRef.current, {
            type: mimeType.split(';')[0]
          });
          
          setRecordedBlob(blob);
          setIsRecording(false);
          setIsPaused(false);
          resolve(blob);
        } catch (error) {
          console.error('Error creating recording blob:', error);
          resolve(null);
        }
      };
      
      // Stop recording
      mediaRecorder.stop();
    });
  }, [mimeType]);
  
  // Pause recording
  const pauseRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  }, []);
  
  // Resume recording
  const resumeRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  }, []);
  
  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isPaused,
    recordedBlob
  };
}