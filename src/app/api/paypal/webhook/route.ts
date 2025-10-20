
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import client from '@/lib/paypal';
import { updateSubscription } from '@/lib/firebase-service';

export async function POST(req: Request) {
  try {
    const webhookEvent = await req.json();
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!webhookId) {
        throw new Error('PayPal Webhook ID is not configured.');
    }

    // Verify the webhook signature
    const verifyRequest = new paypal.webhooks.WebhooksVerifySignatureRequest();
    const headers = req.headers;
    verifyRequest.requestBody(webhookEvent);
    (verifyRequest as any).headers = { // Type assertion to pass headers
        'auth-algo': headers.get('paypal-auth-algo'),
        'cert-url': headers.get('paypal-cert-url'),
        'transmission-id': headers.get('paypal-transmission-id'),
        'transmission-sig': headers.get('paypal-transmission-sig'),
        'transmission-time': headers.get('paypal-transmission-time'),
    };
    const verification = await client.execute(verifyRequest);
    
    if (verification.result.verification_status !== 'SUCCESS') {
        console.warn('PayPal Webhook verification failed.');
        return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    // Process the event
    if (webhookEvent.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = webhookEvent.resource.id;
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      (request as any).requestBody({}); // Empty body for capture

      const capture = await client.execute(request);
      
      const purchaseUnit = capture.result.purchase_units[0];
      const userId = purchaseUnit.custom_id; // We need to set this when creating order

      if (!userId) {
          console.error('User ID not found in custom_id of PayPal order.');
          return NextResponse.json({ status: 'error', message: 'User ID missing' }, { status: 400 });
      }

      await updateSubscription(userId, 'pro-60d');
    }

    return NextResponse.json({ status: 'received' });
  } catch (err: any) {
    console.error(`PayPal Webhook Error: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
