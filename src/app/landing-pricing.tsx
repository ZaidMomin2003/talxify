
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


import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe } from 'lucide-react';

const freePlan = {
    name: 'Free',
    priceInr: '₹0',
    priceUsd: '$0',
    features: [
        '1 AI Mock Interview',
        '1 AI Coding Quiz',
        '1 AI Study Note Generation',
        '1 AI Question Set Generation',
        '1 Resume Export',
        '1 Day Portfolio Access',
    ],
};

const proPlans = [
    {
        id: 'pro-1m' as SubscriptionPlan,
        name: '1 Month Pro',
        priceInr: 2999,
        priceUsd: 39,
        duration: '1 Month',
        description: 'Perfect for a focused prep sprint.',
        interviews: 10,
    },
    {
        id: 'pro-2m' as SubscriptionPlan,
        name: '2 Months Pro',
        priceInr: 4999,
        originalPriceInr: 5998,
        priceUsd: 69,
        originalPriceUsd: 78,
        duration: '2 Months',
        description: 'Balanced plan for steady preparation.',
        badgeInr: 'Save ₹999',
        badgeUsd: 'Save $9',
        interviews: 25,
    },
    {
        id: 'pro-3m' as SubscriptionPlan,
        name: '3 Months Pro',
        priceInr: 6999,
        originalPriceInr: 8997,
        priceUsd: 89,
        originalPriceUsd: 117,
        duration: '3 Months',
        description: 'Best value for in-depth mastery.',
        badgeInr: 'Save ₹1998',
        badgeUsd: 'Save $28',
        interviews: 40,
    },
]

const proFeatures = [
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
    const [region, setRegion] = useState<'india' | 'international'>('india');
    const selectedPlan = proPlans.find(p => p.id === selectedPlanId);

    return (
        <section className="py-16 sm:py-24" id="pricing">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mb-8 flex flex-col items-center">
                    <Badge variant="outline" className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase">
                        Pricing
                    </Badge>
                    <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
                        A Plan for Every Ambition
                    </h2>
                    <p className="text-muted-foreground max-w-2xl text-center mb-8">
                        Whether you're just starting out or ready to go all-in, we have a plan that fits your needs.
                    </p>

                    <Tabs defaultValue="india" onValueChange={(v) => setRegion(v as any)} className="w-[300px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="india">🇮🇳 India</TabsTrigger>
                            <TabsTrigger value="international" className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                International
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto items-start gap-8">
                    {/* Free Plan */}
                    <Card className="flex flex-col shadow-lg transition-transform duration-300 hover:-translate-y-1 lg:col-span-1 h-full bg-card/50">
                        <CardHeader className="text-center">
                            <UserRound className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <CardTitle className="text-3xl font-bold font-headline">{freePlan.name}</CardTitle>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold tracking-tighter">
                                    {region === 'india' ? freePlan.priceInr : freePlan.priceUsd}
                                </span>
                            </div>
                            <CardDescription>Get a taste of our platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-4">
                                {freePlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <div className="bg-muted text-muted-foreground rounded-full p-1">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">{feature}</span>
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

                    {/* Pro Plans */}
                    <div className="lg:col-span-3 h-full">
                        <Card className="shadow-lg border-primary border-2 shadow-primary/20 h-full flex flex-col bg-card/50">
                            <CardHeader>
                                <div className="flex justify-center items-center gap-3 mb-2 text-primary">
                                    <Star className="w-8 h-8" />
                                    <CardTitle className="text-3xl font-bold font-headline">Pro Plans</CardTitle>
                                </div>
                                <CardDescription className="text-center">Unlock your full potential and land your dream job with our comprehensive toolkit.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 flex-grow">
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {proPlans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={cn(
                                                "relative rounded-lg border p-4 cursor-pointer transition-all duration-300",
                                                selectedPlanId === plan.id ? "border-primary ring-2 ring-primary bg-primary/10" : "hover:border-primary/50 bg-muted/50"
                                            )}
                                        >
                                            {(region === 'india' ? plan.badgeInr : plan.badgeUsd) && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap">
                                                    {region === 'india' ? plan.badgeInr : plan.badgeUsd}
                                                </div>
                                            )}
                                            <p className="font-bold text-lg">{plan.name}</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-bold">
                                                    {region === 'india' ? `₹${plan.priceInr.toLocaleString('en-IN')}` : `$${plan.priceUsd}`}
                                                </span>
                                                {(region === 'india' ? plan.originalPriceInr : plan.originalPriceUsd) && (
                                                    <span className="text-muted-foreground line-through text-sm">
                                                        {region === 'india' ? `₹${plan.originalPriceInr?.toLocaleString('en-IN')}` : `$${plan.originalPriceUsd}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="font-semibold text-center mb-4">All Pro plans include:</p>
                                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                                            <span className="text-sm text-muted-foreground">{proPlans.find(p => p.id === selectedPlanId)?.interviews} AI Mock Interviews</span>
                                        </li>
                                        {proFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                                                <span className="text-sm text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" size="lg">
                                    <Link href="/signup">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Get {proPlans.find(p => p.id === selectedPlanId)?.duration} Pro Access
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
