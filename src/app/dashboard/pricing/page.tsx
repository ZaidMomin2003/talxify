
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, UserRound, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import type { SubscriptionPlan } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';

const freePlan = {
    name: 'Free',
    price: 0,
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
    'Unlimited Coding Questions',
    'Unlimited Study Notes',
    'Interview Question Generator',
    'Professional Resume Builder (10 exports/month)',
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
    const [isRzpLoaded, setIsRzpLoaded] = useState(false);
    const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
    
    // The public URL of your deployed Cloud Function.
    const paymentApiUrl = 'https://us-central1-talxify-ijwhm.cloudfunctions.net/payment';


    useEffect(() => {
        const fetchKey = async () => {
            try {
                const res = await fetch(`${paymentApiUrl}/get-key`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch Razorpay key from server.');
                }
                const { keyId } = await res.json();
                if (!keyId) {
                     throw new Error('Razorpay Key ID is missing from server response.');
                }
                setRazorpayKeyId(keyId);
            } catch (error) {
                console.error("Failed to fetch Razorpay key:", error);
                toast({
                    title: "Configuration Error",
                    description: "Could not load payment configuration. Please refresh the page.",
                    variant: "destructive"
                });
            }
        };
        fetchKey();
    }, [toast]);

    const handlePayment = async (planId: SubscriptionPlan, amount: number) => {
        if (!user) {
            toast({ title: "Not Authenticated", description: "Please log in to purchase a plan.", variant: "destructive" });
            return;
        }
        
        if (!razorpayKeyId) {
            toast({ title: "Configuration Error", description: "Razorpay Key ID is not configured.", variant: "destructive" });
            return;
        }

        setLoadingPlan(planId);

        try {
            // 1. Create Order
            const orderRes = await fetch(`${paymentApiUrl}/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency: 'INR', plan: planId, uid: user.uid }),
            });

            if (!orderRes.ok) {
                 const errorData = await orderRes.json();
                 throw new Error(errorData.error || 'Failed to create order.');
            }
            const order = await orderRes.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: razorpayKeyId,
                amount: order.amount,
                currency: order.currency,
                name: "Talxify",
                description: `Talxify Pro Plan - ${planId}`,
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch(`${paymentApiUrl}/verify-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...response, uid: user.uid, plan: planId }),
                        });
                        
                        if (!verifyRes.ok) {
                            const errorData = await verifyRes.json();
                            throw new Error(errorData.error || 'Payment verification failed.');
                        }

                        toast({
                            title: "Payment Successful!",
                            description: "Your Pro plan has been activated. Refreshing your dashboard...",
                        });

                        window.location.reload();

                    } catch (verifyError: any) {
                        toast({ title: "Payment Verification Failed", description: verifyError.message || "Please contact support.", variant: "destructive" });
                    } finally {
                        setLoadingPlan(null);
                    }
                },
                prefill: {
                    name: user.displayName || '',
                    email: user.email || '',
                },
                theme: {
                    color: "#3F51B5" // Matching primary theme color
                }
            };
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();
            rzp.on('payment.failed', function (response:any){
                toast({
                    title: "Payment Failed",
                    description: response.error.description || "Your payment could not be processed.",
                    variant: "destructive"
                });
                setLoadingPlan(null);
            });

        } catch (error: any) {
            toast({ title: "Payment Error", description: error.message || "Could not initiate payment.", variant: "destructive" });
            setLoadingPlan(null);
        }
    };


    return (
        <>
            <Script 
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setIsRzpLoaded(true)}
            />
            <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">
                        Find the Perfect Plan
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Invest in your future. Choose the plan that best fits your interview preparation timeline.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                    {/* Free Plan */}
                    <Card className="flex flex-col shadow-lg transition-transform duration-300 lg:col-span-1">
                        <CardHeader className="text-center">
                            <UserRound className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <CardTitle className="text-3xl font-bold font-headline">Free</CardTitle>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold tracking-tighter">₹0</span>
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
                                    <Star className="w-8 h-8"/>
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
                                                selectedPlanId === plan.id ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
                                            )}
                                        >
                                            {plan.badge && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-full">
                                                    {plan.badge}
                                                </div>
                                            )}
                                            <p className="font-bold text-lg">{plan.name}</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-bold">₹{plan.priceInr.toLocaleString('en-IN')}</span>
                                                {plan.originalPriceInr && (
                                                    <span className="text-muted-foreground line-through">₹{plan.originalPriceInr.toLocaleString('en-IN')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="font-semibold text-center mb-4">All Pro plans include:</p>
                                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-500 mt-1 shrink-0"/>
                                            <span className="text-sm text-muted-foreground">{proPlans.find(p => p.id === selectedPlanId)?.interviews} AI Mock Interviews</span>
                                        </li>
                                        {proFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-green-500 mt-1 shrink-0"/>
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
                                            onClick={() => handlePayment(plan.id, plan.priceInr)}
                                            disabled={loadingPlan === plan.id || !isRzpLoaded || !razorpayKeyId}
                                        >
                                            {loadingPlan === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
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
