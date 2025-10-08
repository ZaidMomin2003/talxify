
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="flex-1 bg-background py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b pb-6">
            <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-headline text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Effective Date: August 06, 2024</p>
          </CardHeader>
          <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6 p-6 md:p-8">
            <p>
              Please read these Terms of Service ("Terms") carefully before using the Talxify website and services operated by Talxify ("us", "we", or "our"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
            </p>

            <h2 className="text-2xl font-bold">1. Accounts</h2>
            <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            
            <h2 className="text-2xl font-bold">2. User Content</h2>
            <p>You retain ownership of all intellectual property rights in your code, portfolio content, and any other materials you create or upload to the Service ("User Content"). We do not claim any ownership rights to your User Content.</p>

            <h2 className="text-2xl font-bold">3. Prohibited Uses</h2>
            <p>You agree not to use the Service for any unlawful purpose or to engage in any conduct that is abusive, fraudulent, or that violates these Terms. This includes, but is not limited to, attempting to disrupt the integrity or performance of the Service.</p>

            <h2 className="text-2xl font-bold">4. Subscriptions and Payments</h2>
            <p>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). For more details on payments and cancellations, please see our <Link href="/refund-policy" className="text-primary">Refund and Cancellation Policy</Link>.</p>

            <h2 className="text-2xl font-bold">5. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>

            <h2 className="text-2xl font-bold">6. Limitation of Liability</h2>
            <p>In no event shall Talxify, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            
            <h2 className="text-2xl font-bold">7. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of India, with jurisdiction in the courts of Bangalore, Karnataka, without regard to its conflict of law provisions.</p>

            <h2 className="text-2xl font-bold">8. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.</p>

            <h2 className="text-2xl font-bold">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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
