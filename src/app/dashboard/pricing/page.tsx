
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, UserRound, Sparkles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useCallback } from 'react';
import type { SubscriptionPlan } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getUserData } from '@/lib/firebase-service';
import type { UserData } from '@/lib/types';
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

const planPrices: Record<SubscriptionPlan, { INR: number, USD: number }> = {
    'free': { INR: 0, USD: 0 },
    'pro-1m': { INR: 1249, USD: 15 },
    'pro-2m': { INR: 2099, USD: 25 },
    'pro-3m': { INR: 2899, USD: 35 },
};

const planDetails: Record<SubscriptionPlan, { interviews: number; durationMonths: number }> = {
    'free': { interviews: 1, durationMonths: 0 },
    'pro-1m': { interviews: 10, durationMonths: 1 },
    'pro-2m': { interviews: 20, durationMonths: 1 },
    'pro-3m': { interviews: 30, durationMonths: 1 },
};

const proPlans = [
    {
        id: 'pro-1m' as SubscriptionPlan,
        name: 'Essential',
        priceInr: planPrices['pro-1m'].INR,
        priceUsd: planPrices['pro-1m'].USD,
        duration: '1 Month',
        description: 'Perfect for a focused prep sprint.',
        interviews: planDetails['pro-1m'].interviews,
        badgeInr: null,
        badgeUsd: null,
        originalPriceInr: 1599,
        originalPriceUsd: 19,
    },
    {
        id: 'pro-2m' as SubscriptionPlan,
        name: 'Professional',
        priceInr: planPrices['pro-2m'].INR,
        priceUsd: planPrices['pro-2m'].USD,
        duration: '1 Month',
        description: 'Balanced plan for steady preparation.',
        interviews: planDetails['pro-2m'].interviews,
        badgeInr: 'Popular',
        badgeUsd: 'Popular',
        originalPriceInr: 2899,
        originalPriceUsd: 35,
    },
    {
        id: 'pro-3m' as SubscriptionPlan,
        name: 'Elite',
        priceInr: planPrices['pro-3m'].INR,
        priceUsd: planPrices['pro-3m'].USD,
        duration: '1 Month',
        description: 'Best value for in-depth mastery.',
        interviews: planDetails['pro-3m'].interviews,
        badgeInr: 'Best Value',
        badgeUsd: 'Best Value',
        originalPriceInr: 3999,
        originalPriceUsd: 49,
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
    const [region, setRegion] = useState<'india' | 'international'>('international');
    const [userData, setUserData] = useState<UserData | null>(null);
    const searchParams = useSearchParams();

    const fetchUserData = useCallback(async () => {
        if (user) {
            const data = await getUserData(user.uid);
            setUserData(data);
        }
    }, [user]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

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
                    <Tabs defaultValue="international" onValueChange={(v) => setRegion(v as any)} className="w-[300px]">
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
                            <CardFooter className="flex flex-col gap-4">
                                {proPlans.map(plan => {
                                    const isSubscribed = userData?.subscription?.status === 'active';
                                    const interviewsLeft = (userData?.subscription?.interviewUsage?.limit ?? 0) - (userData?.subscription?.interviewUsage?.count ?? 0);
                                    const hasInterviews = interviewsLeft > 0;
                                    const canPurchase = !isSubscribed || !hasInterviews;

                                    return selectedPlanId === plan.id && (
                                        <div key={plan.id} className="w-full space-y-3">
                                            <Button
                                                className="w-full h-12 rounded-xl transition-all"
                                                size="lg"
                                                onClick={() => handlePayment(plan.id)}
                                                disabled={!!loadingPlan || !canPurchase}
                                            >
                                                {loadingPlan === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                {loadingPlan === plan.id
                                                    ? 'Processing...'
                                                    : (!canPurchase ? 'Active Plan' : `Upgrade to ${plan.name}`)
                                                }
                                            </Button>

                                            {!canPurchase && (
                                                <p className="text-[11px] text-center text-muted-foreground font-medium italic">
                                                    You have <span className="text-primary font-bold">{interviewsLeft} interviews</span> remaining.
                                                    You'll be able to purchase a new pack once you've used them all!
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
