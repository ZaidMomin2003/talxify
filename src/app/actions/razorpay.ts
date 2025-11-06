'use server';

/**
 * @fileOverview A server action to securely retrieve the public Razorpay Key ID.
 * This ensures the key is available on the client-side without being hardcoded
 * or exposed in build artifacts.
 */

export async function getRazorpayApiKey() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId) {
    // This error will be caught on the server, but it's crucial for debugging.
    throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured in environment variables.');
  }

  return keyId;
}
