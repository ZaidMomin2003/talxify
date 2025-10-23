
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Star, UserRound, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const freePlan = {
    name: 'Free',
    price: '₹0',
    features: [
        'First Day of 60-Day Arena',
        'AI-Powered Mock Interview',
        'AI-Analyzed Coding Quiz',
        'AI-Generated Study Notes',
        'Limited Portfolio Access (24h)',
    ],
};

const proPlan = {
    name: 'Pro',
    originalPriceInr: '₹9999',
    priceInr: '₹7999',
    priceUsd: '$99',
    period: '/60 days',
};

const proFeatures = [
    'Full 60-Day Arena Access',
    'AI-Powered Mock Interviews',
    'Unlimited Coding Questions',
    'Unlimited Study Notes',
    'Professional Resume Builder',
    'Full Portfolio Customization',
    'Detailed Performance Analytics',
    'Prep To-Do List',
    'Priority Support',
];

const PaymentMethods = () => (
    <div className="border-t pt-6">
        <p className="text-center text-xs text-muted-foreground mb-3">We accept all major payment methods</p>
        <div className="flex flex-wrap justify-center items-center gap-4 opacity-70">
            <img src="https://www.svgrepo.com/show/303202/visa-logo.svg" alt="Visa" className="h-5" />
            <img src="https://www.svgrepo.com/show/303203/mastercard-logo.svg" alt="Mastercard" className="h-5" />
            <img src="https://www.svgrepo.com/show/303408/american-express-logo.svg" alt="American Express" className="h-5" />
            <img src="https://www.svgrepo.com/show/354123/npci-logogram.svg" alt="UPI" className="h-6" />
            <img src="https://www.svgrepo.com/show/303252/paypal-logo.svg" alt="PayPal" className="h-5" />
             <p className="text-sm font-semibold">EMI</p>
        </div>
    </div>
);


export default function LandingPricing() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [currency, setCurrency] = useState('inr');


  useEffect(() => {
    const offerEndDate = new Date();
    offerEndDate.setDate(offerEndDate.getDate() + 30);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = offerEndDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  return (
    <section className="bg-transparent text-foreground py-20 pb-8" id="pricing">
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

        <div className="flex justify-center mb-8">
            <div className="inline-flex items-center rounded-full bg-muted p-1">
                <Button 
                    onClick={() => setCurrency('inr')} 
                    variant={currency === 'inr' ? 'default' : 'ghost'} 
                    size="sm"
                    className={cn("rounded-full")}
                >
                    Indian (INR)
                </Button>
                <Button 
                    onClick={() => setCurrency('usd')} 
                    variant={currency === 'usd' ? 'default' : 'ghost'} 
                    size="sm"
                    className={cn("rounded-full")}
                >
                    International (USD)
                </Button>
            </div>
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

          <Card className="flex flex-col shadow-lg transition-transform duration-300 w-full border-primary border-2 shadow-primary/20 md:-translate-y-4 relative overflow-hidden">
                <Badge className="absolute top-0 right-0 m-4">Most Popular</Badge>
                <CardHeader className="text-center">
                  <Sparkles className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle className="text-3xl font-bold font-headline">Pro</CardTitle>
                  <div className="flex items-baseline justify-center gap-2">
                     {currency === 'inr' ? (
                        <>
                            <span className="text-3xl font-medium text-muted-foreground line-through">{proPlan.originalPriceInr}</span>
                            <span className="text-5xl font-bold tracking-tighter">{proPlan.priceInr}</span>
                        </>
                     ) : (
                        <span className="text-5xl font-bold tracking-tighter">{proPlan.priceUsd}</span>
                     )}
                    <span className="text-muted-foreground text-lg">{proPlan.period}</span>
                  </div>
                  <CardDescription>Unlock your full potential and land your dream job.</CardDescription>
                   {currency === 'inr' && (
                        <div className="bg-destructive/10 text-destructive-foreground border border-destructive/20 rounded-lg p-2 mt-2">
                            <p className="text-sm font-semibold">Limited Time Offer Ends In:</p>
                            <div className="flex justify-center gap-2 text-lg font-mono font-bold">
                                <div>{timeLeft.days}d</div>
                                <div>:</div>
                                <div>{timeLeft.hours}h</div>
                                <div>:</div>
                                <div>{timeLeft.minutes}m</div>
                                <div>:</div>
                                <div>{timeLeft.seconds}s</div>
                            </div>
                        </div>
                   )}
              </CardHeader>
              <CardContent className="flex-grow">
                  <ul className="space-y-4">
                      {proFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                              <div className="bg-primary/10 text-primary rounded-full p-1">
                                  <Check className="w-4 h-4" />
                              </div>
                              <span className="text-muted-foreground">{feature}</span>
                          </li>
                      ))}
                  </ul>
                   <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
                        10x your chance of cracking the interview.
                   </div>
              </CardContent>
              <CardFooter className="flex-col gap-6">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/signup">Choose Plan</Link>
                  </Button>
                  <PaymentMethods />
              </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
