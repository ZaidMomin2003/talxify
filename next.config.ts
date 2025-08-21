
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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blocks.mvp-subha.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
  },
  allowedDevOrigins: [
    "https://*.cloudworkstations.dev",
    "https://*.firebase.studio"
  ],
  env: {
    NEXT_PUBLIC_DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_VIDEOSDK_API_KEY: process.env.VIDEOSDK_API_KEY,
  }
};

export default nextConfig;
