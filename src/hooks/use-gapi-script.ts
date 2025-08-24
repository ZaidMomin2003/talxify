
'use client';

import { useState, useEffect } from 'react';

// Helper function to load a script
const loadScript = (src: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.body.appendChild(script);
  });
};


export function useGapiScript() {
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isGisLoaded, setIsGisLoaded] = useState(false);

  useEffect(() => {
    const loadGapi = async () => {
      try {
        await loadScript('https://apis.google.com/js/api.js', 'gapi-script');
        
        window.gapi.load('client:picker', () => {
            setIsGapiLoaded(true);
        });

      } catch (error) {
        console.error('Failed to load GAPI script:', error);
      }
    };
    
    const loadGis = async () => {
        try {
            await loadScript('https://accounts.google.com/gsi/client', 'gis-script');
            setIsGisLoaded(true);
        } catch (error) {
            console.error('Failed to load GIS script:', error);
        }
    };

    loadGapi();
    loadGis();
  }, []);

  return { isGapiLoaded, isGisLoaded };
}
