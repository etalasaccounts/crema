import { EventEmitter } from 'events';

/**
 * MediaStreamManager - A singleton service to manage media streams outside of Redux
 * This prevents serialization errors by keeping non-serializable objects out of the Redux store
 */
class MediaStreamManager extends EventEmitter {
  private static instance: MediaStreamManager;
  
  private _microphoneStream: MediaStream | null = null;
  private _cameraStream: MediaStream | null = null;
  private _screenStream: MediaStream | null = null;
  
  private constructor() {
    super();
  }
  
  public static getInstance(): MediaStreamManager {
    if (!MediaStreamManager.instance) {
      MediaStreamManager.instance = new MediaStreamManager();
    }
    return MediaStreamManager.instance;
  }
  
  // Microphone Stream
  public get microphoneStream(): MediaStream | null {
    return this._microphoneStream;
  }
  
  public setMicrophoneStream(stream: MediaStream | null): void {
    // Clean up previous stream if exists
    if (this._microphoneStream && stream !== this._microphoneStream) {
      this._microphoneStream.getTracks().forEach(track => track.stop());
    }
    
    this._microphoneStream = stream;
    this.emit('microphoneStreamChanged', stream);
  }
  
  // Camera Stream
  public get cameraStream(): MediaStream | null {
    return this._cameraStream;
  }
  
  public setCameraStream(stream: MediaStream | null): void {
    // Clean up previous stream if exists
    if (this._cameraStream && stream !== this._cameraStream) {
      this._cameraStream.getTracks().forEach(track => track.stop());
    }
    
    this._cameraStream = stream;
    this.emit('cameraStreamChanged', stream);
  }
  
  // Screen Stream
  public get screenStream(): MediaStream | null {
    return this._screenStream;
  }
  
  public setScreenStream(stream: MediaStream | null): void {
    // Clean up previous stream if exists
    if (this._screenStream && stream !== this._screenStream) {
      this._screenStream.getTracks().forEach(track => track.stop());
    }
    
    this._screenStream = stream;
    this.emit('screenStreamChanged', stream);
    
    // Add event listener for when user stops sharing
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          this.setScreenStream(null);
          // Emit without recordingTime when browser stops sharing
          // The listener will need to get the time from the recording component
          this.emit('screenSharingEnded');
        });
      }
    }
  }
  
  // Clear all streams
  public clearAllStreams(): void {
    if (this._microphoneStream) {
      this._microphoneStream.getTracks().forEach(track => track.stop());
      this._microphoneStream = null;
    }
    
    if (this._cameraStream) {
      this._cameraStream.getTracks().forEach(track => track.stop());
      this._cameraStream = null;
    }
    
    if (this._screenStream) {
      this._screenStream.getTracks().forEach(track => track.stop());
      this._screenStream = null;
    }
    
    this.emit('allStreamsCleared');
  }
}

// Export the singleton instance
export const mediaStreamManager = MediaStreamManager.getInstance();