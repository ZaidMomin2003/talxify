
'use client';

import { useState, useEffect } from 'react';

// Define the shape of the window object to include GAPI and GIS
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

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
  const [gapi, setGapi] = useState<any>(null);
  const [gis, setGis] = useState<any>(null);


  useEffect(() => {
    const loadApis = async () => {
      try {
        await loadScript('https://apis.google.com/js/api.js', 'gapi-script');
        await loadScript('https://accounts.google.com/gsi/client', 'gis-script');

        window.gapi.load('client:picker', () => {
            setGapi(window.gapi);
            setIsGapiLoaded(true);
        });

        setGis(window.google);
        setIsGisLoaded(true);
        
      } catch (error) {
        console.error('Failed to load Google API scripts:', error);
      }
    };

    loadApis();
  }, []);

  return { gapi, gis, isGapiLoaded, isGisLoaded };
}
