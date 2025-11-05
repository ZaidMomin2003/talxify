
'use server';

// This file is intentionally left blank to remove Razorpay functionality.
// The payment flow is now simulated in the pricing page.

export async function getRazorpayKeyId() {
  return null;
}

export async function createOrder(amount: number, planId: string) {
  return null;
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  return { isAuthentic: true };
}
