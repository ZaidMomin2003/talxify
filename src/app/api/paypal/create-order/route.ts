
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import client from '@/lib/paypal';

export async function POST(req: Request) {
  const { amount } = await req.json();

  if (!amount) {
    return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: amount.toString(),
      }
    }]
  });

  try {
    const order = await client.execute(request);
    return NextResponse.json(order.result);
  } catch (err: any) {
    console.error("PayPal Create Order Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
