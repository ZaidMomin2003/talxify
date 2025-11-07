'use server';

/**
 * @fileOverview A server action to securely retrieve the Razorpay API key.
 * This prevents exposing sensitive keys directly in the client-side bundle.
 */

export async function getRazorpayApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!apiKey) {
    console.error('Razorpay Key ID is not configured in environment variables.');
    return null;
  }

  return apiKey;
}
