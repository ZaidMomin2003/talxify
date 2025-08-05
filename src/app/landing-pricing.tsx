
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const monthlyPlan = {
  name: 'Monthly',
  price: '₹1099',
  period: '/month',
  features: [
    '20 AI Mock Interviews',
    'Unlimited Coding Questions',
    'Weekly feedback',
    'Portfolio Builder',
    'Detailed Analytics',
    '24/7 Customer Support',
  ],
  isPopular: false,
};

const yearlyPlan = {
  name: 'Yearly',
  price: '₹10999',
  period: '/year',
  features: [
    '300 AI Mock Interviews',
    'Unlimited Coding Questions',
    'Weekly feedback',
    'Portfolio Builder',
    'Detailed Analytics',
    '24/7 Customer Support',
  ],
  isPopular: true,
};

const PricingCard = ({ plan }: { plan: typeof monthlyPlan | typeof yearlyPlan }) => (
  <Card className={cn(
    "flex flex-col shadow-lg transition-transform duration-300 w-full",
    plan.isPopular ? "border-primary border-2 shadow-primary/20 md:-translate-y-4" : "border-border"
  )}>
    {plan.isPopular && (
      <div className="relative">
        <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-4 rounded-t-lg flex items-center justify-center gap-2">
          <Star className="w-4 h-4" />
          <span>Most Popular</span>
        </div>
         <div className="absolute top-0 right-0 -mt-3 mr-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full rotate-12">
            Save 25%
        </div>
      </div>
    )}
    <CardHeader className="text-center">
      <CardTitle className="text-3xl font-bold font-headline">{plan.name}</CardTitle>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
        <span className="text-muted-foreground text-lg">{plan.period}</span>
      </div>
      <CardDescription>{plan.isPopular ? "Get the best value and commit to your success." : "Perfect for a short-term boost."}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
       {!plan.isPopular && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="text-center mt-4">
              <Button variant="link" size="sm">Learn more about features</Button>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Monthly Plan Features</DialogTitle>
              <DialogDescription>
                Here's a detailed look at what's included in the Monthly Plan to help you succeed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary rounded-full p-1 mt-1">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{feature}</h4>
                    <p className="text-sm text-muted-foreground">
                      {
                        [
                          "Practice with our advanced AI that simulates real-world technical and behavioral interviews.",
                          "Access an infinite library of questions on any topic, at any difficulty level, to sharpen your skills.",
                          "Receive personalized reports from our AI on your progress, highlighting strengths and areas for improvement.",
                          "Automatically create a professional portfolio page to showcase your skills and quiz results to employers.",
                          "Dive deep into your performance with comprehensive charts and statistics on your dashboard.",
                          "Get help whenever you need it with our dedicated customer support team, available around the clock."
                        ][index]
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button asChild className="w-full" size="lg">
                <Link href="/signup">Get Started with Monthly Plan</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </CardContent>
    <CardFooter>
      <Button asChild className="w-full" size="lg" variant={plan.isPopular ? 'default' : 'secondary'}>
        <Link href="/signup">Choose Plan</Link>
      </Button>
    </CardFooter>
  </Card>
);

export default function LandingPricing() {
  return (
    <section className="bg-background text-foreground py-20 pb-8" id="pricing">
      <div className="container mx-auto max-w-5xl px-6 relative">
         <div className="absolute top-0 left-0 z-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 z-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Simple, transparent pricing. Pick the plan that's right for you and start preparing today.
          </p>
        </div>

        <div className="grid gap-y-10 md:gap-x-8 md:grid-cols-2 max-w-3xl mx-auto relative z-10">
          <PricingCard plan={monthlyPlan} />
          <PricingCard plan={yearlyPlan} />
        </div>
      </div>
    </section>
  );
}
