
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <main className="flex-1 bg-background py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b pb-6">
            <PackageCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-headline text-4xl font-bold">Service Delivery Policy</h1>
            <p className="text-muted-foreground">Effective Date: August 06, 2024</p>
          </CardHeader>
          <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6 p-6 md:p-8">
            <p>
              This Service Delivery Policy explains how Talxify provides you with access to our digital products and services. As our offerings are entirely digital, there is no physical shipping involved.
            </p>

            <h2 className="text-2xl font-bold">1. Nature of Products</h2>
            <p>All products and services offered by Talxify, including but not limited to AI mock interviews, coding gym access, and premium features, are digital in nature. They are accessible through our website and platform.</p>

            <h2 className="text-2xl font-bold">2. Service Activation and Delivery</h2>
            <p>
              Upon successful completion of your payment via our payment gateway (Razorpay), your subscription plan is activated immediately.
            </p>
            <ul>
              <li><strong>Instant Access:</strong> Once your payment is confirmed, your account will be upgraded, and you will have immediate access to all the features included in your chosen subscription plan.</li>
              <li><strong>Access Method:</strong> All services can be accessed by logging into your account on the Talxify dashboard. No physical goods will be shipped, and no shipping address is required.</li>
              <li><strong>Confirmation:</strong> You will receive an email confirmation of your subscription purchase and payment, which will also serve as a confirmation of service activation.</li>
            </ul>

            <h2 className="text-2xl font-bold">3. Access Issues</h2>
            <p>If you encounter any issues accessing your premium features after a successful payment, please take the following steps:</p>
            <ul>
              <li>Log out and log back into your account to refresh your session.</li>
              <li>If the issue persists, please contact our support team immediately with your payment confirmation details. We are committed to resolving access issues promptly.</li>
            </ul>
            
            <h2 className="text-2xl font-bold">4. Contact Us</h2>
            <p>
              For any questions or issues regarding service delivery, please contact our support team:
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
