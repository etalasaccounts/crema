import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setMicPermission,
  setCameraPermission,
  setMicActive,
  setCameraActive,
  setScreenActive,
  setAudioDevices,
  setVideoDevices,
  setSelectedAudioDevice,
  setSelectedVideoDevice,
} from '@/store/slices/mediaSlice';
import { mediaStreamManager } from '@/lib/services/MediaStreamManager';

export function useMediaRedux({ onDialogOpen = false } = {}) {
  const dispatch = useAppDispatch();
  const { 
    micPermission,
    cameraPermission,
    micActive,
    cameraActive,
    screenActive,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    isStandby
  } = useAppSelector(state => state.media);

  // Helper functions for UI
  const getSelectedAudioDeviceLabel = (): string => {
    const device = audioDevices.find(d => d.deviceId === selectedAudioDevice);
    return device?.label || 'Default microphone';
  };

  const getSelectedVideoDeviceLabel = (): string => {
    const device = videoDevices.find(d => d.deviceId === selectedVideoDevice);
    return device?.label || 'Default camera';
  };

  // Check permissions
  const checkPermissions = async () => {
    if (navigator.permissions) {
      try {
        const micPermissionStatus = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        dispatch(setMicPermission(micPermissionStatus.state as 'granted' | 'denied' | 'prompt'));

        const cameraPermissionStatus = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        dispatch(setCameraPermission(cameraPermissionStatus.state as 'granted' | 'denied' | 'prompt'));
      } catch (error) {
        console.warn('Permissions API not fully supported:', error);
      }
    }
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      dispatch(setMicPermission('granted'));
      stream.getTracks().forEach((track) => track.stop());
      await loadAudioDevices();
      return true;
    } catch (error) {
      dispatch(setMicPermission('denied'));
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  };

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      dispatch(setCameraPermission('granted'));
      stream.getTracks().forEach((track) => track.stop());
      await loadVideoDevices();
      return true;
    } catch (error) {
      dispatch(setCameraPermission('denied'));
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  // Force device enumeration with a temporary stream to ensure labels
  const forceDeviceEnumeration = useCallback(async () => {
    // This will ensure we get device labels by temporarily getting a stream
    let tempStream = null;
    try {
      // Try to get both audio and video at once to minimize permission prompts
      tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (e) {
      // If that fails, try just audio
      try {
        tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        // If that fails too, try just video
        try {
          tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (error) {
          console.warn('Could not get temporary stream for device labels', error);
        }
      }
    }
    
    // Get device list with labels
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Stop the temporary stream
    if (tempStream) {
      tempStream.getTracks().forEach(track => track.stop());
    }
    
    return devices;
  }, []);

  // Load audio devices
  const loadAudioDevices = useCallback(async () => {
    if (micPermission === 'granted') {
      try {
        // Get devices with labels
        const devices = await forceDeviceEnumeration();
        const mics = devices.filter((device) => device.kind === 'audioinput');
        
        const formattedMics = mics.map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`
        }));

        // Update Redux state with devices
        dispatch(setAudioDevices(formattedMics));

        // Set first device as default if not already selected
        if (formattedMics.length > 0 && !selectedAudioDevice) {
          dispatch(setSelectedAudioDevice(formattedMics[0].deviceId));
        }
        
        console.log('Loaded audio devices:', formattedMics);
        return formattedMics;
      } catch (error) {
        console.error('Error loading audio devices:', error);
        return [];
      }
    }
    return [];
  }, [dispatch, forceDeviceEnumeration, micPermission, selectedAudioDevice]);

  // Load video devices
  const loadVideoDevices = useCallback(async () => {
    if (cameraPermission === 'granted') {
      try {
        // Get devices with labels
        const devices = await forceDeviceEnumeration();
        const cameras = devices.filter((device) => device.kind === 'videoinput');
        
        const formattedCameras = cameras.map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`
        }));
        
        // Update Redux state with devices
        dispatch(setVideoDevices(formattedCameras));

        // Set first device as default if not already selected
        if (formattedCameras.length > 0 && !selectedVideoDevice) {
          dispatch(setSelectedVideoDevice(formattedCameras[0].deviceId));
        }
        
        console.log('Loaded video devices:', formattedCameras);
        return formattedCameras;
      } catch (error) {
        console.error('Error loading video devices:', error);
        return [];
      }
    }
    return [];
  }, [dispatch, forceDeviceEnumeration, cameraPermission, selectedVideoDevice]);

  // Activate microphone
  const activateMicrophone = async (deviceId?: string) => {
    if (micPermission !== 'granted') {
      const permitted = await requestMicrophonePermission();
      if (!permitted) return null;
    }

    try {
      // Stop any existing microphone stream via the manager
      if (mediaStreamManager.microphoneStream) {
        mediaStreamManager.setMicrophoneStream(null);
      }

      // Create new stream
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Store stream in the manager instead of Redux
      mediaStreamManager.setMicrophoneStream(stream);
      
      // Update Redux with active state only (not the stream itself)
      dispatch(setMicActive(true));
      
      return stream;
    } catch (error) {
      console.error('Error activating microphone:', error);
      dispatch(setMicActive(false));
      return null;
    }
  };

  // Activate camera
  const activateCamera = async (deviceId?: string) => {
    if (cameraPermission !== 'granted') {
      const permitted = await requestCameraPermission();
      if (!permitted) return null;
    }

    try {
      // Stop any existing camera stream via the manager
      if (mediaStreamManager.cameraStream) {
        mediaStreamManager.setCameraStream(null);
      }

      // Create new stream
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Store stream in the manager instead of Redux
      mediaStreamManager.setCameraStream(stream);
      
      // Update Redux with active state only (not the stream itself)
      dispatch(setCameraActive(true));
      
      return stream;
    } catch (error) {
      console.error('Error activating camera:', error);
      dispatch(setCameraActive(false));
      return null;
    }
  };

  // Capture screen for sharing
  const captureScreen = async () => {
    try {
      // Stop any existing screen stream via the manager
      if (mediaStreamManager.screenStream) {
        mediaStreamManager.setScreenStream(null);
      }

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      // Store stream in the manager instead of Redux
      mediaStreamManager.setScreenStream(stream);
      
      // Update Redux with active state only
      dispatch(setScreenActive(true));
      
      // Add event listener for when user stops sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        mediaStreamManager.setScreenStream(null);
        dispatch(setScreenActive(false));
      });
      
      return stream;
    } catch (error) {
      console.error('Error capturing screen:', error);
      dispatch(setScreenActive(false));
      
      // Provide user-friendly error message
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.log('Screen capture permission denied by user');
        } else if (error.name === 'NotFoundError') {
          console.log('No screen capture source available');
        } else {
          console.log('Screen capture failed:', error.message);
        }
      }
      
      return null;
    }
  };

  // Deactivate microphone
  const deactivateMicrophone = () => {
    if (mediaStreamManager.microphoneStream) {
      mediaStreamManager.setMicrophoneStream(null);
    }
    dispatch(setMicActive(false));
  };

  // Deactivate camera
  const deactivateCamera = () => {
    if (mediaStreamManager.cameraStream) {
      mediaStreamManager.setCameraStream(null);
    }
    dispatch(setCameraActive(false));
  };

  // Deactivate screen sharing
  const deactivateScreen = () => {
    if (mediaStreamManager.screenStream) {
      mediaStreamManager.setScreenStream(null);
    }
    dispatch(setScreenActive(false));
  };

  // Clean up all media streams
  const cleanupAllMedia = () => {
    mediaStreamManager.clearAllStreams();
    dispatch(setMicActive(false));
    dispatch(setCameraActive(false));
    dispatch(setScreenActive(false));
  };
  
  // Listen for stream change events from the manager
  useEffect(() => {
    const onScreenSharingEnded = () => {
      dispatch(setScreenActive(false));
    };
    
    mediaStreamManager.on('screenSharingEnded', onScreenSharingEnded);
    
    return () => {
      mediaStreamManager.removeListener('screenSharingEnded', onScreenSharingEnded);
    };
  }, [dispatch]);

  // Initialize on dialog open
  useEffect(() => {
    if (onDialogOpen) {
      checkPermissions();
    }
    
    // Cleanup on unmount
    return () => {
      // Don't automatically clean up streams here as they may be needed elsewhere
    };
  }, [onDialogOpen]);

  return {
    // State helpers (from Redux)
    micPermission,
    cameraPermission,
    micActive,
    cameraActive,
    screenActive,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    
    // Stream access (from manager)
    getMicrophoneStream: () => mediaStreamManager.microphoneStream,
    getCameraStream: () => mediaStreamManager.cameraStream,
    getScreenStream: () => mediaStreamManager.screenStream,
    
    // Helper methods
    getSelectedAudioDeviceLabel,
    getSelectedVideoDeviceLabel,
    
    // Permission methods
    checkPermissions,
    requestMicrophonePermission,
    requestCameraPermission,
    
    // Device methods
    loadAudioDevices,
    loadVideoDevices,
    
    // Stream control methods
    activateMicrophone,
    activateCamera,
    captureScreen,
    deactivateMicrophone,
    deactivateCamera,
    deactivateScreen,
    cleanupAllMedia
  };
}