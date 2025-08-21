'use server';

import jwt from 'jsonwebtoken';

export async function generateVideoSDKToken() {
  const apiKey = process.env.VIDEOSDK_API_KEY;
  const secretKey = process.env.VIDEOSDK_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.error('VideoSDK API key or secret not found in environment variables.');
    throw new Error('VideoSDK API key or secret not configured.');
  }

  const payload = {
    apikey: apiKey,
    permissions: ['allow_join', 'allow_mod'],
  };

  const options = {
    expiresIn: '1h',
    algorithm: 'HS256' as const,
  };

  try {
    const token = jwt.sign(payload, secretKey, options);
    return token;
  } catch (error) {
    console.error('Error generating VideoSDK token:', error);
    throw new Error('Could not generate VideoSDK token.');
  }
}
