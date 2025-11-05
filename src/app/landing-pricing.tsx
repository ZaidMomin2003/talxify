
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, UserRound, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionPlan } from '@/lib/types';


const freePlan = {
    name: 'Free',
    price: '₹0',
    features: [
        '5 AI interactions per day',
        'Limited Arena access (Day 1)',
        '2 Resume exports per day',
        'Limited Portfolio customization',
    ],
};

const proPlans = [
    {
        id: 'pro-1m' as SubscriptionPlan,
        name: '1 Month Pro',
        priceInr: 2999,
        duration: '1 Month',
        description: 'Perfect for a focused prep sprint.',
        interviews: 10,
    },
    {
        id: 'pro-2m' as SubscriptionPlan,
        name: '2 Months Pro',
        priceInr: 4999,
        originalPriceInr: 5998,
        duration: '2 Months',
        description: 'Balanced plan for steady preparation.',
        badge: 'Save ₹999',
        interviews: 25,
    },
    {
        id: 'pro-3m' as SubscriptionPlan,
        name: '3 Months Pro',
        priceInr: 6999,
        originalPriceInr: 8997,
        duration: '3 Months',
        description: 'Best value for in-depth mastery.',
        badge: 'Save ₹1998',
        interviews: 40,
    },
]

const proFeatures = [
    'AI-Powered Mock Interviews',
    'Unlimited Coding Questions',
    'Unlimited Study Notes',
    'Interview Question Generator',
    'Professional Resume Builder (10 exports/month)',
    'Full Portfolio Customization',
    'Detailed Performance Analytics',
    'Prep To-Do List',
    'Priority Support',
];


export default function LandingPricing() {
    const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan>('pro-2m');
    const selectedPlan = proPlans.find(p => p.id === selectedPlanId);

    return (
        <section className="bg-background py-16 sm:py-24" id="pricing">
             <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mb-12 flex flex-col items-center">
                    <Badge variant="outline" className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase">
                        Pricing
                    </Badge>
                    <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
                        A Plan for Every Ambition
                    </h2>
                    <p className="text-muted-foreground max-w-2xl text-center">
                        Whether you're just starting out or ready to go all-in, we have a plan that fits your needs.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <Card className="flex flex-col shadow-lg transition-transform duration-300 hover:-translate-y-1">
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
                            <Button asChild className="w-full" size="lg" variant="secondary">
                                <Link href="/signup">Start for Free</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="relative flex flex-col shadow-lg transition-transform duration-300 hover:-translate-y-1 border-primary border-2 shadow-primary/20">
                        <div className="absolute top-0 right-0 -mt-3 -mr-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                                <Star className="h-6 w-6" />
                            </div>
                        </div>
                        <CardHeader className="text-center">
                            <Sparkles className="h-10 w-10 mx-auto text-primary mb-2" />
                            <CardTitle className="text-3xl font-bold font-headline">Pro</CardTitle>
                             <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedPlanId}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-baseline justify-center gap-2"
                                >
                                    {selectedPlan?.originalPriceInr && (
                                        <span className="text-3xl font-medium text-muted-foreground line-through">
                                            ₹{selectedPlan.originalPriceInr.toLocaleString('en-IN')}
                                        </span>
                                    )}
                                    <span className="text-5xl font-bold tracking-tighter">
                                        ₹{selectedPlan?.priceInr.toLocaleString('en-IN')}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                            <CardDescription>All the tools you need to land your dream job.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1 mb-6">
                                {proPlans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        className={cn(
                                            "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            selectedPlanId === plan.id ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                                        )}
                                    >
                                        {plan.badge && (
                                            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-full">
                                                {plan.badge}
                                            </div>
                                        )}
                                        {plan.duration}
                                    </button>
                                ))}
                            </div>
                             <ul className="space-y-4">
                                {proFeatures.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <div className="bg-primary/10 text-primary rounded-full p-1">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                                <li className="flex items-center gap-3">
                                    <div className="bg-primary/10 text-primary rounded-full p-1">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-muted-foreground">{selectedPlan?.interviews} AI Mock Interviews</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                           <Button asChild className="w-full" size="lg">
                                <Link href="/signup">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Get Pro Access
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    );
}

    