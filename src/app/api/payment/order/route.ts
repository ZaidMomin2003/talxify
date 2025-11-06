
import { NextResponse } from 'next/server';
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_KEY) {
        throw new Error('Razorpay API keys are not configured on the server.');
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    return NextResponse.json({ success: true, order });

  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
