
import { NextResponse } from 'next/server';
import crypto from "crypto";
import { updateSubscription } from '@/lib/firebase-service';
import type { SubscriptionPlan } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = body;

    if (!process.env.RAZORPAY_SECRET_KEY) {
        throw new Error('Razorpay secret key is not configured for verification.');
    }
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
        // Payment is authentic, update user's subscription in DB
        await updateSubscription(userId, planId as SubscriptionPlan);
        return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
        return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
