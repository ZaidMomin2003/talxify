
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    "flex flex-col shadow-lg transition-transform duration-300",
    plan.isPopular ? "border-primary border-2 shadow-primary/20" : "border-border"
  )}>
    {plan.isPopular && (
      <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-4 rounded-t-lg flex items-center justify-center gap-2">
        <Star className="w-4 h-4" />
        <span>Most Popular</span>
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
    </CardContent>
    <CardFooter>
      <Button asChild className="w-full" size="lg" variant={plan.isPopular ? 'default' : 'secondary'}>
        <Link href="#">Choose Plan</Link>
      </Button>
    </CardFooter>
  </Card>
);

export default function PricingPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">
                Choose Your Plan
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Simple, transparent pricing. Pick the plan that's right for you and start preparing today.
            </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            <PricingCard plan={monthlyPlan} />
            <PricingCard plan={yearlyPlan} />
        </div>
    </main>
  );
}
