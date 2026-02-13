
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, UserRound, Sparkles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useCallback } from 'react';
import type { SubscriptionPlan } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { createRazorpayOrder, verifyRazorpayPayment, createDodoPaymentSession } from './actions';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from 'next/navigation';

const freePlan = {
    name: 'Free',
    price: 0,
    features: [
        '1 AI Mock Interview',
        '1 AI Coding Quiz',
        '1 AI Study Note Generation',
        '1 AI Question Set Generation',
        '1 Day Portfolio Access',
        'Basic Analytics',
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
    'Professional Resume Builder',
    'Full Portfolio Customization',
    'Detailed Performance Analytics',
    'Prep To-Do List',
    'Priority Support',
];


export default function PricingPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan>('pro-2m');
    const [region, setRegion] = useState<'india' | 'international'>('india');
    const searchParams = useSearchParams();

    useEffect(() => {
        const success = searchParams.get('success');
        if (success === 'true') {
            toast({
                title: 'Payment Successful!',
                description: 'Your international Pro plan is being activated. Please wait a moment.',
            });
        }
    }, [searchParams, toast]);

    const handlePayment = async (planId: SubscriptionPlan) => {
        if (!user) {
            toast({ title: "Not Authenticated", description: "Please log in to purchase a plan.", variant: "destructive" });
            return;
        }
        setLoadingPlan(planId);

        try {
            const currency = region === 'india' ? 'INR' : 'USD';

            if (region === 'international') {
                // Use Dodo Payments for International
                const { url } = await createDodoPaymentSession(user.uid, planId);
                if (url) {
                    window.location.href = url; // Redirect to Dodo Checkout
                } else {
                    throw new Error("Failed to generate checkout URL");
                }
                return;
            }

            // Use Razorpay for India
            const order = await createRazorpayOrder(user.uid, planId, currency);

            // 2. Configure the Razorpay checkout options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Talxify',
                description: `${region === 'india' ? 'India' : 'International'} Pro Plan Subscription - ${planId}`,
                order_id: order.id,

                handler: async function (response: any) {
                    const verificationData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        uid: user.uid,
                        planId: planId,
                    };

                    try {
                        const result = await verifyRazorpayPayment(verificationData);

                        if (result.success) {
                            toast({ title: 'Payment Successful!', description: 'Welcome to Pro! Your plan is now active.' });
                            window.location.reload();
                        } else {
                            toast({ variant: 'destructive', title: 'Payment Verification Failed' });
                        }
                    } catch (verifyError: any) {
                        toast({ variant: 'destructive', title: 'Verification Error', description: verifyError.message });
                    }
                },
                prefill: {
                    name: user.displayName || 'User',
                    email: user.email || '',
                },
                theme: {
                    color: '#3F51B5',
                },
                modal: {
                    ondismiss: function () {
                        setLoadingPlan(null);
                    }
                }
            };

            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Payment Error', description: error.message });
            setLoadingPlan(null);
        }
    };


    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">
                        Find the Perfect Plan
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Invest in your future. Choose the plan that best fits your interview preparation timeline.
                    </p>
                </div>

                <div className="flex justify-center mb-12">
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

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                    {/* Free Plan */}
                    <Card className="flex flex-col shadow-lg transition-transform duration-300 lg:col-span-1">
                        <CardHeader className="text-center">
                            <UserRound className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <CardTitle className="text-3xl font-bold font-headline">Free</CardTitle>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold tracking-tighter">
                                    {region === 'india' ? '₹0' : '$0'}
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
                                        <span className="text-muted-foreground text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" variant="secondary" disabled>Your Current Plan</Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plans */}
                    <div className="lg:col-span-3">
                        <Card className="shadow-lg border-primary border-2 shadow-primary/20">
                            <CardHeader>
                                <div className="flex justify-center items-center gap-3 mb-2 text-primary">
                                    <Star className="w-8 h-8" />
                                    <CardTitle className="text-3xl font-bold font-headline">Pro Plans</CardTitle>
                                </div>
                                <CardDescription className="text-center">Unlock your full potential and land your dream job with our comprehensive toolkit.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {proPlans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={cn(
                                                "relative rounded-lg border p-4 cursor-pointer transition-all duration-300",
                                                selectedPlanId === plan.id ? "border-primary ring-2 ring-primary bg-primary/10" : "hover:border-primary/50"
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
                                {proPlans.map(plan => (
                                    selectedPlanId === plan.id && (
                                        <Button
                                            key={plan.id}
                                            className="w-full"
                                            size="lg"
                                            onClick={() => handlePayment(plan.id)}
                                            disabled={loadingPlan === plan.id}
                                        >
                                            {loadingPlan === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            {loadingPlan === plan.id ? 'Processing...' : `Get ${plan.duration} Pro Access`}
                                        </Button>
                                    )
                                ))}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
