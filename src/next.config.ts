

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
    domains: ["res.cloudinary.com", "placehold.co", "blocks.mvp-subha.me", "randomuser.me", "drive.google.com", "lh3.googleusercontent.com"],
  },
  experimental: {
    transpilePackages: ['@react-three/drei', '@react-three/fiber', 'three'],
  },
  allowedDevOrigins: [
    "https://*.cloudworkstations.dev",
    "https://*.firebase.studio"
  ],
  // Only public keys (prefixed with NEXT_PUBLIC_) should be here.
  // Secret keys should be in .env and accessed directly via process.env on the server.
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    NEXT_PUBLIC_VIDEOSDK_API_KEY: process.env.VIDEOSDK_API_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  }
};

export default nextConfig;
