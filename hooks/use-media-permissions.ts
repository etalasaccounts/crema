import { useState, useEffect } from "react";

export type PermissionStatus = "granted" | "denied" | "prompt" | "checking";

interface UseMediaPermissionsProps {
  onDialogOpen?: boolean;
}

interface UseMediaPermissionsReturn {
  micPermission: PermissionStatus;
  cameraPermission: PermissionStatus;
  requestMicrophonePermission: () => Promise<void>;
  requestCameraPermission: () => Promise<void>;
  checkPermissions: () => Promise<void>;
  activateMicrophone: (deviceId?: string) => Promise<MediaStream | null>;
  activateCamera: (deviceId?: string) => Promise<MediaStream | null>;
  deactivateMicrophone: () => void;
  deactivateCamera: () => void;
}

export function useMediaPermissions({ onDialogOpen }: UseMediaPermissionsProps = {}): UseMediaPermissionsReturn {
  const [micPermission, setMicPermission] = useState<PermissionStatus>("checking");
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>("checking");
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Effect to check permissions when dialog opens
  useEffect(() => {
    if (onDialogOpen) {
      checkPermissions();
    }
    
    // Cleanup on unmount
    return () => {
      deactivateMicrophone();
      deactivateCamera();
    };
  }, [onDialogOpen]);

  const checkPermissions = async () => {
    // Check stored permissions first
    const storedMicPermission = localStorage.getItem("micPermission") as PermissionStatus;
    const storedCameraPermission = localStorage.getItem("cameraPermission") as PermissionStatus;
    
    // Set initial states from localStorage if available
    if (storedMicPermission) setMicPermission(storedMicPermission);
    if (storedCameraPermission) setCameraPermission(storedCameraPermission);
    
    // Verify actual permissions with the browser
    await checkMicrophonePermission();
    await checkCameraPermission();
  };

  const checkMicrophonePermission = async () => {
    try {
      // Check if we've already been granted permission
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (audioDevices.length > 0 && audioDevices.some(device => device.label !== '')) {
        setMicPermission("granted");
        localStorage.setItem("micPermission", "granted");
        return;
      }
      
      // If we don't have a stored permission or it's not "granted", don't request it automatically
      if (micPermission !== "granted" && micPermission !== "denied") {
        setMicPermission("prompt");
      }
    } catch (error) {
      console.error("Error checking microphone permission:", error);
    }
  };

  const checkCameraPermission = async () => {
    try {
      // Check if we've already been granted permission
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length > 0 && videoDevices.some(device => device.label !== '')) {
        setCameraPermission("granted");
        localStorage.setItem("cameraPermission", "granted");
        return;
      }
      
      // If we don't have a stored permission or it's not "granted", don't request it automatically
      if (cameraPermission !== "granted" && cameraPermission !== "denied") {
        setCameraPermission("prompt");
      }
    } catch (error) {
      console.error("Error checking camera permission:", error);
    }
  };

  const requestMicrophonePermission = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks - we're just requesting permission, not actually using it yet
      stream.getTracks().forEach(track => track.stop());
      setMicPermission("granted");
      localStorage.setItem("micPermission", "granted");
      
      // Refresh device list
      await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      setMicPermission("denied");
      localStorage.setItem("micPermission", "denied");
      console.error("Error requesting microphone permission:", error);
    }
  };

  const requestCameraPermission = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop all tracks - we're just requesting permission, not actually using it yet
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission("granted");
      localStorage.setItem("cameraPermission", "granted");
      
      // Refresh device list
      await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      setCameraPermission("denied");
      localStorage.setItem("cameraPermission", "denied");
      console.error("Error requesting camera permission:", error);
    }
  };

  // Activate microphone with specific device if provided
  const activateMicrophone = async (deviceId?: string): Promise<MediaStream | null> => {
    try {
      // Stop any existing microphone stream
      deactivateMicrophone();
      
      // Get a new stream with the specified device
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMicStream(stream);
      return stream;
    } catch (error) {
      console.error("Error activating microphone:", error);
      return null;
    }
  };

  // Activate camera with specific device if provided
  const activateCamera = async (deviceId?: string): Promise<MediaStream | null> => {
    try {
      // Stop any existing camera stream
      deactivateCamera();
      
      // Get a new stream with the specified device
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      return stream;
    } catch (error) {
      console.error("Error activating camera:", error);
      return null;
    }
  };

  // Deactivate microphone
  const deactivateMicrophone = () => {
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
    }
  };

  // Deactivate camera
  const deactivateCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  return {
    micPermission,
    cameraPermission,
    requestMicrophonePermission,
    requestCameraPermission,
    checkPermissions,
    activateMicrophone,
    activateCamera,
    deactivateMicrophone,
    deactivateCamera
  };
} 