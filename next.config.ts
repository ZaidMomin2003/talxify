

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
        },
        {
            protocol: 'https',
            hostname: 'picsum.photos',
        },
        {
            protocol: 'https',
            hostname: 'randomuser.me',
        },
        {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 'drive.google.com',
        },
        {
          protocol: 'https',
          hostname: 'placehold.co',
        },
    ]
  },
  allowedDevOrigins: [
    "https://*.cloudworkstations.dev",
    "https://*.firebase.studio"
  ],
  // Only public keys (prefixed with NEXT_PUBLIC_) should be here.
  // Secret keys should be in .env and accessed directly via process.env on the server.
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_VIDEOSDK_API_KEY: process.env.NEXT_PUBLIC_VIDEOSDK_API_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_DEEPGRAM_API_KEY: process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID, // Ensure this is available for the new action
  }
};

export default nextConfig;
