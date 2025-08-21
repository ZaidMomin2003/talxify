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
    
    // Always initialize the Featurebase function
    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    
    const bootConfig: any = {
      appId: "689df97845396713701c443c",
      theme: theme || 'dark',
      language: "en",
    };
    
    // Configure based on whether the user is logged in or not
    if (user) {
        bootConfig.email = user.email ?? undefined;
        bootConfig.userId = user.uid;
        bootConfig.createdAt = user.metadata?.creationTime;
    } else {
        bootConfig.shouldDisableIdentityVerification = true;
    }

    // Boot Featurebase messenger with the constructed configuration
    win.Featurebase("boot", bootConfig);

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
