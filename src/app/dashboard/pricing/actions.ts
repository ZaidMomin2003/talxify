
'use server';

import Razorpay from 'razorpay';
import { DodoPayments } from 'dodopayments';
import crypto from 'crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import type { SubscriptionPlan, UserData } from '@/lib/types';
import { addMonths } from 'date-fns';
import { adminConfig } from '@/lib/firebase-admin-config';

// Initialize Firebase Admin SDK safely
function getDb() {
  if (!getApps().length) {
    if (adminConfig.credential.projectId && adminConfig.credential.clientEmail && adminConfig.credential.privateKey) {
      initializeApp({
        credential: cert(adminConfig.credential),
      });
    } else {
      console.error('[PAYMENT-ACTIONS] Firebase Admin credentials missing.');
      throw new Error('Firebase Admin not configured.');
    }
  }
  return getFirestore();
}

// Lazy initializers for SDKs
let razorpayInstance: Razorpay | null = null;
let dodoInstance: DodoPayments | null = null;

function getRazorpay() {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay API keys are not configured.');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

function getDodo() {
  if (!dodoInstance) {
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      throw new Error('Dodo Payments API key is not configured.');
    }
    dodoInstance = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    });
  }
  return dodoInstance;
}

/**
 * Creates an order on Razorpay's servers.
 * @param uid - The user's unique ID to associate with the order.
 * @param planId - The subscription plan being purchased.
 * @param currency - The currency code (INR or USD).
 * @returns The order details needed by the frontend.
 */
export async function createRazorpayOrder(uid: string, planId: SubscriptionPlan, currency: 'INR' | 'USD' = 'INR') {
  // SECURITY FIX: Define prices on the server, do NOT trust the 'amount' from the client.
  const planPrices: Record<SubscriptionPlan, { INR: number, USD: number }> = {
    'free': { INR: 0, USD: 0 },
    'pro-1m': { INR: 1249, USD: 15 },
    'pro-2m': { INR: 2099, USD: 25 },
    'pro-3m': { INR: 2899, USD: 35 },
  };

  const prices = planPrices[planId] || { INR: 0, USD: 0 };
  const serverPrice = currency === 'USD' ? prices.USD : prices.INR;

  const options = {
    amount: serverPrice * 100, // Razorpay requires amount in the smallest currency unit
    currency: currency,
    receipt: `receipt_order_${new Date().getTime()}`,
    notes: {
      uid: uid,
      plan: planId,
      currency: currency,
    }
  };

  try {
    const rzp = getRazorpay();
    const order = await rzp.orders.create(options);
    return {
      id: order.id,
      currency: order.currency,
      amount: order.amount
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Could not create Razorpay order.');
  }
}

/**
 * Creates a Dodo Payments checkout session for international users.
 */
export async function createDodoPaymentSession(uid: string, planId: SubscriptionPlan) {
  const productMapping: Record<SubscriptionPlan, string | undefined> = {
    'free': undefined,
    'pro-1m': process.env.DODO_PRODUCT_ID_1M,
    'pro-2m': process.env.DODO_PRODUCT_ID_2M,
    'pro-3m': process.env.DODO_PRODUCT_ID_3M,
  };

  const productId = productMapping[planId];
  if (!productId) {
    throw new Error(`Dodo Product ID for ${planId} is not configured.`);
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured in production settings.');
  }

  try {
    const dodo = getDodo();
    const session = await dodo.checkoutSessions.create({
      product_cart: [{
        product_id: productId,
        quantity: 1,
      }],
      metadata: {
        uid: uid,
        planId: planId,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing?success=true`,
    });

    return { url: session.checkout_url };
  } catch (error: any) {
    console.error('Error creating Dodo payment session:', error);

    // Bubble up the specific error message from Dodo or our validation
    const errorMessage = error?.message || 'Unknown Dodo error';
    const errorDetails = error?.response?.data?.message || '';

    throw new Error(`Dodo Session Error: ${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
  }
}

interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  uid: string;
  planId: SubscriptionPlan;
}

const planDetails: Record<SubscriptionPlan, { interviews: number; durationMonths: number }> = {
  'free': { interviews: 1, durationMonths: 0 },
  'pro-1m': { interviews: 10, durationMonths: 1 },
  'pro-2m': { interviews: 20, durationMonths: 1 },
  'pro-3m': { interviews: 30, durationMonths: 1 },
};

/**
 * Verifies the payment signature from Razorpay and updates the user's subscription.
 * @param data - The payment details from the frontend.
 * @returns A success or failure message.
 */
export async function verifyRazorpayPayment(data: PaymentVerificationData) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uid, planId } = data;

  // The body to be hashed is the order_id + "|" + payment_id
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay secret is not configured.');
  }

  // Create an HMAC-SHA256 hash using your Razorpay secret
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  // If the signature is authentic, update the user's record in the database
  if (isAuthentic) {
    const db = getDb();
    const userRef = db.collection('users').doc(uid);
    const selectedPlan = planDetails[planId];

    if (!selectedPlan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    const currentDate = new Date();
    const endDate = addMonths(currentDate, selectedPlan.durationMonths);

    const subscriptionData = {
      plan: planId,
      status: 'active',
      startDate: currentDate.toISOString(),
      endDate: endDate.toISOString(),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      interviewUsage: {
        limit: selectedPlan.interviews,
        count: 0
      },
      // Reset resume exports for the new subscription month
      resumeExports: {
        date: currentDate.toISOString().slice(0, 7), // YYYY-MM
        count: 0
      },
    };

    try {
      await userRef.set({ subscription: subscriptionData }, { merge: true });
      return { success: true, message: "Payment verified successfully." };
    } catch (dbError) {
      console.error('Error updating user document:', dbError);
      throw new Error('Could not update user subscription.');
    }
  }

  return { success: false, message: "Payment verification failed." };
}
