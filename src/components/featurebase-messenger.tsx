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
    
    // Prepare user data, ensuring it exists before passing
    const featurebaseUser = user ? {
        email: user.email ?? undefined,
        userId: user.uid,
        createdAt: user.metadata?.creationTime,
    } : {};

    // Boot Featurebase messenger with configuration
    win.Featurebase("boot", {
      appId: "689df97845396713701c443c",
      ...featurebaseUser,
      theme: theme || 'dark', // Pass theme, default to dark
      language: "en",
    });

  }, [user, theme]); // Re-run effect if user or theme changes

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
