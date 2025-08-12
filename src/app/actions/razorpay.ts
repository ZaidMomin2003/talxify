
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function createOrder(amount: number) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured in environment variables.');
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amount * 100, // amount in the smallest currency unit (e.g., paise for INR)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Could not create payment order.');
  }
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay key secret is not configured.');
  }
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  return { isAuthentic };
}
