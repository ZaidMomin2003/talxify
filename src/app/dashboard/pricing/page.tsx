
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { createOrder, verifyPayment } from '@/app/actions/razorpay';
import Script from 'next/script';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { updateSubscription } from '@/lib/firebase-service';
import { useRouter } from 'next/navigation';

const plans = [
    {
        name: 'Monthly',
        price: 1099,
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
    },
    {
        name: 'Yearly',
        price: 10999,
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
    }
];

export default function PricingPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handlePayment = async (plan: typeof plans[0]) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to make a purchase.", variant: "destructive" });
            return;
        }

        setLoadingPlan(plan.name);

        try {
            const order = await createOrder(plan.price);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Talxify',
                description: `Subscription - ${plan.name} Plan`,
                order_id: order.id,
                handler: async function (response: any) {
                    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
                    
                    const { isAuthentic } = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

                    if (isAuthentic) {
                        const planType = plan.name.toLowerCase() as 'monthly' | 'yearly';
                        await updateSubscription(user.uid, planType);
                        toast({
                            title: "Payment Successful!",
                            description: `Your ${plan.name} subscription is now active.`,
                        });
                        router.push('/dashboard');
                    } else {
                        toast({
                            title: "Payment Verification Failed",
                            description: "Your payment could not be verified. Please contact support.",
                            variant: "destructive",
                        });
                    }
                },
                prefill: {
                    name: user.displayName || '',
                    email: user.email || '',
                },
                theme: {
                    color: '#8A2BE2'
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            toast({ title: "Payment Error", description: "Something went wrong. Please try again.", variant: "destructive" });
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
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
                    {plans.map((plan) => (
                        <Card key={plan.name} className={cn(
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
                                    <span className="text-5xl font-bold tracking-tighter">₹{plan.price}</span>
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
                                <Button
                                    className="w-full"
                                    size="lg"
                                    variant={plan.isPopular ? 'default' : 'secondary'}
                                    onClick={() => handlePayment(plan)}
                                    disabled={loadingPlan === plan.name}
                                >
                                    {loadingPlan === plan.name ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        'Choose Plan'
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </>
    );
}
