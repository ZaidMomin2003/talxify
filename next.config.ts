
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
  }
};

export default nextConfig;

    