'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, UserRound, Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { createOrder, verifyPayment } from '@/app/actions/razorpay';
import Script from 'next/script';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { updateSubscription } from '@/lib/firebase-service';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const freePlan = {
    name: 'Free',
    price: 0,
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
        price: 1699,
        originalPrice: null,
        interviews: '20 AI Mock Interviews',
    },
    yearly: {
        name: 'Yearly',
        price: 16990,
        originalPrice: null,
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


export default function PricingPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isYearly, setIsYearly] = useState(false);

    const activeProPlan = isYearly ? proPlans.yearly : proPlans.monthly;

    const handlePayment = async () => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to make a purchase.", variant: "destructive" });
            return;
        }

        setLoadingPlan(activeProPlan.name);

        try {
            const order = await createOrder(activeProPlan.price);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Talxify',
                description: `Subscription - ${activeProPlan.name} Plan`,
                order_id: order.id,
                handler: async function (response: any) {
                    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
                    
                    const { isAuthentic } = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

                    if (isAuthentic) {
                        const planType = isYearly ? 'yearly' : 'monthly';
                        await updateSubscription(user.uid, planType);
                        toast({
                            title: "Payment Successful!",
                            description: `Your ${activeProPlan.name} subscription is now active.`,
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

                 <Alert className="max-w-4xl mx-auto mb-8 bg-primary/5 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Launch Offer!</AlertTitle>
                    <AlertDescription>
                        Use coupon code <strong className="text-foreground">FIRST1000</strong> at checkout to get a special discount on our Pro plans.
                    </AlertDescription>
                </Alert>


                <div className="flex justify-center items-center gap-4 mb-10">
                    <Label htmlFor="billing-cycle" className={cn("font-medium", !isYearly && "text-primary")}>Monthly</Label>
                    <Switch
                        id="billing-cycle"
                        checked={isYearly}
                        onCheckedChange={setIsYearly}
                        aria-label="Switch between monthly and yearly billing"
                    />
                    <Label htmlFor="billing-cycle" className={cn("font-medium relative", isYearly && "text-primary")}>
                        Yearly
                        <span className="absolute -top-4 -right-12 text-xs bg-destructive text-destructive-foreground font-bold px-2 py-0.5 rounded-full rotate-12">Save 17%</span>
                    </Label>
                </div>


                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                     {/* Free Plan */}
                    <Card className="flex flex-col shadow-lg transition-transform duration-300">
                        <CardHeader className="text-center">
                            <UserRound className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <CardTitle className="text-3xl font-bold font-headline">Free</CardTitle>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold tracking-tighter">₹0</span>
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
                            <Button className="w-full" size="lg" variant="secondary" disabled>Your Current Plan</Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="flex flex-col shadow-lg transition-transform duration-300 border-primary border-2 shadow-primary/20">
                         <CardHeader className="text-center">
                            <Sparkles className="h-10 w-10 mx-auto text-primary mb-2" />
                            <CardTitle className="text-3xl font-bold font-headline">Pro</CardTitle>
                             <div className="flex items-baseline justify-center gap-2">
                                {activeProPlan.originalPrice && (
                                     <span className="text-3xl font-medium text-muted-foreground line-through">₹{activeProPlan.originalPrice}</span>
                                )}
                                <span className="text-5xl font-bold tracking-tighter">₹{activeProPlan.price}</span>
                                <span className="text-muted-foreground text-lg">/{isYearly ? 'year' : 'month'}</span>
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
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handlePayment}
                                disabled={loadingPlan === activeProPlan.name}
                            >
                                {loadingPlan === activeProPlan.name ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    'Upgrade to Pro'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </>
    );
}
