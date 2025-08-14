
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Star, UserRound, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const freePlan = {
    name: 'Free',
    price: '₹0',
    features: [
        '1 AI Mock Interview (one-time)',
        '1 Coding Question (one-time)',
        'Portfolio Builder',
        'Limited Analytics',
    ],
};

const proPlans = {
    monthly: {
        name: 'Monthly',
        price: '₹1699',
        period: '/month',
        interviews: '20 AI Mock Interviews',
    },
    yearly: {
        name: 'Yearly',
        price: '₹16990',
        period: '/year',
        interviews: '300 AI Mock Interviews',
    }
};

const proFeatures = [
    'Unlimited Coding Questions',
    'Weekly feedback',
    'Portfolio Builder',
    'Detailed Analytics',
    '24/7 Customer Support',
];


export default function LandingPricing() {
  const [isYearly, setIsYearly] = useState(false);
  const activeProPlan = isYearly ? proPlans.yearly : proPlans.monthly;

  return (
    <section className="bg-background text-foreground py-20 pb-8" id="pricing">
      <div className="container mx-auto max-w-5xl px-6 relative">
         <div className="absolute top-0 left-0 z-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 z-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Simple, transparent pricing. Pick the plan that's right for you and start preparing today.
          </p>
        </div>

        <div className="flex justify-center items-center gap-4 mb-10 relative z-10">
            <Label htmlFor="billing-cycle-landing" className={cn("font-medium", !isYearly && "text-primary")}>Monthly</Label>
            <Switch
                id="billing-cycle-landing"
                checked={isYearly}
                onCheckedChange={setIsYearly}
                aria-label="Switch between monthly and yearly billing"
            />
            <Label htmlFor="billing-cycle-landing" className={cn("font-medium relative", isYearly && "text-primary")}>
                Yearly
                <span className="absolute -top-4 -right-12 text-xs bg-destructive text-destructive-foreground font-bold px-2 py-0.5 rounded-full rotate-12">Save 17%</span>
            </Label>
        </div>

        <div className="grid gap-y-10 md:gap-x-8 md:grid-cols-2 max-w-4xl mx-auto relative z-10">
          <Card className="flex flex-col shadow-lg transition-transform duration-300 w-full border-border">
              <CardHeader className="text-center">
                  <UserRound className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <CardTitle className="text-3xl font-bold font-headline">{freePlan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold tracking-tighter">{freePlan.price}</span>
                  </div>
                  <CardDescription>Get a taste of our platform, forever free.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                  <ul className="space-y-4">
                      {freePlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                              <div className="bg-muted text-muted-foreground rounded-full p-1">
                                  <Check className="w-4 h-4" />
                              </div>
                              <span className="text-muted-foreground">{feature}</span>
                          </li>
                      ))}
                  </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" size="lg" variant='secondary'>
                    <Link href="/signup">Start for Free</Link>
                </Button>
              </CardFooter>
          </Card>

          <Card className="flex flex-col shadow-lg transition-transform duration-300 w-full border-primary border-2 shadow-primary/20 md:-translate-y-4">
              <CardHeader className="text-center">
                  <Sparkles className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle className="text-3xl font-bold font-headline">Pro</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold tracking-tighter">{activeProPlan.price}</span>
                      <span className="text-muted-foreground text-lg">{activeProPlan.period}</span>
                  </div>
                  <CardDescription>Unlock your full potential and land your dream job.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                  <ul className="space-y-4">
                      {[activeProPlan.interviews, ...proFeatures].map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                              <div className="bg-primary/10 text-primary rounded-full p-1">
                                  <Check className="w-4 h-4" />
                              </div>
                              <span className="text-muted-foreground">{feature}</span>
                          </li>
                      ))}
                  </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" size="lg">
                    <Link href="/signup">Choose Plan</Link>
                </Button>
              </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
