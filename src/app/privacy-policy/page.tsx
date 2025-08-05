
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-background py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b pb-6">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-headline text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: August 05, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6 p-6 md:p-8">
            <p>
              Talxify ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>

            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <p>We may collect personal information from you in a variety of ways, including:</p>
            <ul>
              <li><strong>Personal Data:</strong> We collect personally identifiable information, such as your name, email address, and password when you register for an account.</li>
              <li><strong>Portfolio Data:</strong> To provide our portfolio building services, we may collect additional information you provide, such as your college name, projects, skills, and work experience.</li>
              <li><strong>Performance Data:</strong> We collect data related to your performance in mock interviews and coding quizzes, including your answers, scores, and the AI-generated feedback.</li>
              <li><strong>Usage Data:</strong> We automatically collect information about how you access and use the service, such as your IP address, browser type, and pages visited.</li>
            </ul>

            <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Provide, operate, and maintain our services.</li>
              <li>Analyze your performance and provide personalized feedback.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Communicate with you, including for customer service and to provide you with updates and other information relating to the service.</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
            </ul>

            <h2 className="text-2xl font-bold">3. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share information with third-party vendors and service providers that perform services for us, such as hosting and analytics. We may also disclose your information if required by law.</p>
            
            <h2 className="text-2xl font-bold">4. Data Security</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
            
            <h2 className="text-2xl font-bold">5. Your Data Rights</h2>
            <p>You have the right to access, update, or delete the information we have on you. You can do this at any time by accessing your account settings or by contacting us.</p>

            <h2 className="text-2xl font-bold">6. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2 className="text-2xl font-bold">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <strong>Email:</strong> <a href="mailto:hi@contact.talxify.space" className="text-primary">hi@contact.talxify.space</a>
              <br />
              <strong>Phone:</strong> +91 8431326909
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
