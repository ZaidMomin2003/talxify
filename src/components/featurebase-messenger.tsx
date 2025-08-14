
"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "next-themes";

const FeaturebaseMessenger = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // We only want to boot the messenger if the user is logged in
    // or if you want it to be available for anonymous users as well.
    // For this implementation, we will boot it for all users.
    
    const win = window as any;
    
    // Initialize Featurebase if it doesn't exist
    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    
    // Boot Featurebase messenger with configuration
    win.Featurebase("boot", {
      appId: "YOUR_APP_ID_HERE", // IMPORTANT: Replace with your actual Featurebase App ID
      // Pass user data if available
      ...(user && {
        email: user.email,
        userId: user.uid,
        createdAt: user.metadata.creationTime,
      }),
      theme: theme || 'dark', // Use the app's current theme
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
