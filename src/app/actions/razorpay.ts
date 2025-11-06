'use server';

import Razorpay from 'razorpay';
import { randomBytes } from 'crypto';
import { updateSubscription } from '@/lib/firebase-service';
import type { SubscriptionPlan } from '@/lib/types';


/**
 * Securely retrieves the Razorpay Key ID for the client.
 * This prevents exposing the secret key.
 */
export async function getRazorpayKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    console.error('RAZORPAY_KEY_ID is not configured in environment variables.');
    return null;
  }
  return keyId;
}

/**
 * Creates a new Razorpay order on the server.
 * @param amount The amount in the smallest currency unit (e.g., paise for INR).
 * @param planId The ID of the subscription plan being purchased.
 * @returns The order details from Razorpay.
 */
export async function createOrder(amount: number, planId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_SECRET_KEY;

  if (!keyId || !keySecret) {
    console.error('Razorpay API keys are not configured on the server.');
    throw new Error('Payment gateway is not configured. Please ensure RAZORPAY_KEY_ID and RAZORPAY_SECRET_KEY are set.');
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const options = {
    amount,
    currency: 'INR',
    receipt: `receipt_order_${randomBytes(8).toString('hex')}`,
    notes: {
      planId: planId, // Store planId in notes
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error: any) {
    console.error('Razorpay createOrder error:', error.message);
    // Rethrow the error so the client can catch it.
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
}

/**
 * Verifies the payment signature returned by Razorpay.
 * @param razorpay_order_id The ID of the order from Razorpay.
 * @param razorpay_payment_id The ID of the payment from Razorpay.
 * @param razorpay_signature The signature to verify.
 * @param userId The ID of the user making the purchase.
 * @param planId The ID of the plan purchased.
 * @returns An object indicating if the payment is authentic.
 */
export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  userId: string,
  planId: SubscriptionPlan
) {
  const generated_signature = require('crypto')
    .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY!)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  const isAuthentic = generated_signature === razorpay_signature;

  if (isAuthentic) {
    // If payment is authentic, update the user's subscription in Firebase.
    try {
      await updateSubscription(userId, planId);
      return { isAuthentic: true };
    } catch (error) {
      console.error("Failed to update subscription after payment verification:", error);
      return { isAuthentic: false, error: "Failed to update subscription." };
    }
  }

  return { isAuthentic: false, error: "Invalid payment signature." };
}
