"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "next-themes";

const FeaturebaseMessenger = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const win = window as any;
    
    // Initialize Featurebase if it doesn't exist
    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    
    // Prepare user data object, ensuring metadata exists before access
    const featurebaseUser = user && user.metadata ? {
        email: user.email,
        userId: user.uid,
        createdAt: user.metadata.creationTime,
    } : {};

    // Boot Featurebase messenger with configuration
    win.Featurebase("boot", {
      appId: "689df97845396713701c443c",
      ...featurebaseUser,
      theme: theme || 'dark',
      language: "en",
    });

  }, [user, theme]);

  return (
    <>
      {/* Load the Featurebase SDK */}
      <Script 
        src="https://do.featurebase.app/js/sdk.js" 
        id="featurebase-sdk" 
        strategy="afterInteractive"
      />
    </>
  );
};

export default FeaturebaseMessenger;
