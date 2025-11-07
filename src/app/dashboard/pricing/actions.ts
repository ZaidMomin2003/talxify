
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import type { SubscriptionPlan, UserData } from '@/lib/types';
import { addMonths } from 'date-fns';
import { adminConfig } from '@/lib/firebase-admin-config';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(adminConfig.credential),
  });
}
const db = getFirestore();

// Initialize Razorpay with your API keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Creates an order on Razorpay's servers.
 * @param amount - The amount in the base currency (e.g., rupees, not paise).
 * @param uid - The user's unique ID to associate with the order.
 * @returns The order details needed by the frontend.
 */
export async function createRazorpayOrder(amount: number, uid: string, planId: SubscriptionPlan) {
  const options = {
    amount: amount * 100, // Razorpay requires amount in the smallest currency unit (e.g., paise, cents)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`, // A unique receipt ID
    notes: {
        uid: uid, // Storing the user's ID in notes is helpful for verification
        plan: planId,
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    // Return only what the frontend needs to open the checkout modal
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

interface PaymentVerificationData {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    uid: string;
    planId: SubscriptionPlan;
}

const planDetails: Record<SubscriptionPlan, { interviews: number; durationMonths: number }> = {
    'free': { interviews: 0, durationMonths: 0 },
    'pro-1m': { interviews: 10, durationMonths: 1 },
    'pro-2m': { interviews: 25, durationMonths: 2 },
    'pro-3m': { interviews: 40, durationMonths: 3 },
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

    // Create an HMAC-SHA256 hash using your Razorpay secret
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    // If the signature is authentic, update the user's record in the database
    if (isAuthentic) {
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
