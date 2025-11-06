
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
    NEXT_PUBLIC_PAYMENT_API_URL: process.env.NEXT_PUBLIC_PAYMENT_API_URL,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  }
};

export default nextConfig;
