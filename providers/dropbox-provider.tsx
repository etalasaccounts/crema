'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface DropboxContextType {
  isLoaded: boolean;
  appKey: string | null;
}

const DropboxContext = createContext<DropboxContextType>({
  isLoaded: false,
  appKey: null,
});

export function useDropboxEmbed() {
  return useContext(DropboxContext);
}

interface DropboxProviderProps {
  children: React.ReactNode;
  appKey?: string;
}

export function DropboxProvider({ children, appKey }: DropboxProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const finalAppKey = appKey || process.env.NEXT_PUBLIC_DROPBOX_APP_KEY || null;

  useEffect(() => {
    // Only load if we have an app key and script isn't already loaded
    if (!finalAppKey || document.getElementById('dropboxjs')) {
      setIsLoaded(!!document.getElementById('dropboxjs'));
      return;
    }

    const script = document.createElement('script');
    script.id = 'dropboxjs';
    script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
    script.setAttribute('data-app-key', finalAppKey);
    script.async = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Dropbox Embedder script');
      setIsLoaded(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup script on unmount if needed
      const existingScript = document.getElementById('dropboxjs');
      if (existingScript) {
        existingScript.remove();
        setIsLoaded(false);
      }
    };
  }, [finalAppKey]);

  return (
    <DropboxContext.Provider value={{ isLoaded, appKey: finalAppKey }}>
      {children}
    </DropboxContext.Provider>
  );
}