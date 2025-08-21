
'use server';
import jwt from 'jsonwebtoken';

export async function generateVideoSDKToken() {
    const apiKey = process.env.VIDEOSDK_API_KEY;
    const secret = process.env.VIDEOSDK_SECRET;

    if (!apiKey || !secret) {
        throw new Error('VideoSDK API key and secret are not configured in environment variables.');
    }

    const payload = {
        apikey: apiKey,
        permissions: ['allow_join'], // Allow the user to join the meeting
    };

    const token = jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn: '1h', // Token valid for 1 hour
        jwtid: Math.random().toString(36).substring(2),
    });

    return token;
}
