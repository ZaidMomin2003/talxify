
"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "next-themes";

const FeaturebaseMessenger = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // Do not initialize until the auth state is determined.
    if (loading) {
      return;
    }
    
    const win = window as any;
    
    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    
    const bootConfig: any = {
      appId: "689df97845396713701c443c",
      theme: theme || 'dark',
      language: "en",
      // This disables the userHash check, which is the recommended fix for this error
      // in client-side-only implementations.
      shouldDisableIdentityVerification: true, 
    };
    
    if (user) {
        bootConfig.email = user.email ?? undefined;
        bootConfig.userId = user.uid;
        bootConfig.name = user.displayName ?? undefined;
        bootConfig.createdAt = user.metadata?.creationTime ? new Date(user.metadata.creationTime) : undefined;
    }

    win.Featurebase("boot", bootConfig);

  }, [user, loading, theme]);

  return (
    <>
      <Script 
        src="https://do.featurebase.app/js/sdk.js" 
        id="featurebase-sdk" 
        strategy="afterInteractive"
      />
    </>
  );
};

export default FeaturebaseMessenger;
