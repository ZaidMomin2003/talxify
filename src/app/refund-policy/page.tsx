
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function RefundPolicyPage() {
  const effectiveDate = format(new Date(), 'MMMM dd, yyyy');

  return (
    <main className="flex-1 bg-background py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b pb-6">
            <CircleDollarSign className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-headline text-4xl font-bold">Refund and Cancellation Policy</h1>
            <p className="text-muted-foreground">Effective Date: {effectiveDate}</p>
          </CardHeader>
          <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6 p-6 md:p-8">
            <p>
              Thank you for subscribing to Talxify. This policy outlines our terms regarding refunds and cancellations for our subscription-based services.
            </p>

            <h2 className="text-2xl font-bold">1. General Policy</h2>
            <p>All subscriptions are final. Due to the nature of our digital services and the immediate access provided upon payment, **we do not offer refunds** for any subscription fees, whether for monthly or yearly plans. Once a payment is made, it is non-refundable.</p>

            <h2 className="text-2xl font-bold">2. Cancellation Policy</h2>
            <p>You have the right to cancel your subscription at any time. You can manage your subscription and cancel your plan from your account dashboard.</p>
            <ul>
              <li>When you cancel a subscription, you will continue to have access to all paid features until the end of your current billing period.</li>
              <li>At the end of the billing period, your subscription will expire, and you will not be charged again. Your account will then be downgraded to the free or basic tier, if available.</li>
            </ul>

            <h2 className="text-2xl font-bold">3. No Prorated Refunds</h2>
            <p>We do not provide prorated refunds for subscriptions that are canceled mid-cycle. You will be responsible for the full subscription fee for the billing period in which you cancel.</p>
            
            <h2 className="text-2xl font-bold">4. Exceptional Circumstances</h2>
            <p>Refunds will not be issued for dissatisfaction with the service, lack of use, or forgetting to cancel your subscription. We encourage users to fully explore our platform to ensure it meets their needs before purchasing a subscription.</p>

            <h2 className="text-2xl font-bold">5. Changes to this Policy</h2>
            <p>We reserve the right to modify this Refund and Cancellation Policy at any time. Any changes will be posted on this page, and your continued use of the service after such changes have been posted will constitute your acceptance of the new policy.</p>

            <h2 className="text-2xl font-bold">6. Contact Us</h2>
            <p>
              If you have any questions about this policy, please contact our support team before making a purchase.
              <br />
              <strong>Email:</strong> <a href="mailto:hii@talxify.space" className="text-primary">hii@talxify.space</a>
              <br />
              <strong>Phone:</strong> +91 8431326909
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
