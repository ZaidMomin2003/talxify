
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, UserRound, Sparkles, Info, Ticket } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

const freePlan = {
    name: 'Free',
    price: 0,
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
    priceInr: 4999,
    discountedPriceInr: 3999,
    priceUsd: 200,
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


export default function PricingPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [currency, setCurrency] = useState('inr');

    const finalPriceInr = isCouponApplied ? proPlan.discountedPriceInr : proPlan.priceInr;

    const handleApplyCoupon = () => {
        if (couponCode.toUpperCase() === 'FIRST1000') {
            setIsCouponApplied(true);
            toast({
                title: "Coupon Applied!",
                description: "The ₹1000 discount has been applied.",
            });
        } else {
            toast({
                title: "Invalid Coupon",
                description: "The coupon code you entered is not valid.",
                variant: "destructive",
            });
        }
    };


    const handlePayment = async () => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to make a purchase.", variant: "destructive" });
            return;
        }

        if (currency === 'usd') {
            toast({
                title: 'Coming Soon!',
                description: 'International payments will be available shortly. Please check back later.',
            });
            return;
        }

        setLoadingPlan(proPlan.name);

        try {
            const order = await createOrder(finalPriceInr);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Talxify',
                description: `Pro Plan - 60 Days Access`,
                order_id: order.id,
                handler: async function (response: any) {
                    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
                    
                    const { isAuthentic } = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

                    if (isAuthentic) {
                        await updateSubscription(user.uid, 'pro-60d');
                        toast({
                            title: "Payment Successful!",
                            description: `Your Pro subscription is now active.`,
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
                    color: '#3F51B5'
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
                 <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center rounded-full bg-muted p-1">
                        <Button onClick={() => setCurrency('inr')} variant={currency === 'inr' ? 'secondary' : 'ghost'} className="rounded-full">Indian (INR)</Button>
                        <Button onClick={() => setCurrency('usd')} variant={currency === 'usd' ? 'secondary' : 'ghost'} className="rounded-full">International (USD)</Button>
                    </div>
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
                            {currency === 'inr' ? (
                                <div className="flex items-baseline justify-center gap-2">
                                    {isCouponApplied ? (
                                        <>
                                            <span className="text-3xl font-medium text-muted-foreground line-through">₹{proPlan.priceInr}</span>
                                            <span className="text-5xl font-bold tracking-tighter">₹{proPlan.discountedPriceInr}</span>
                                        </>
                                    ) : (
                                        <span className="text-5xl font-bold tracking-tighter">₹{proPlan.priceInr}</span>
                                    )}
                                    <span className="text-muted-foreground text-lg">/60 days</span>
                                </div>
                            ) : (
                                <div className="flex items-baseline justify-center gap-2">
                                     <span className="text-5xl font-bold tracking-tighter">${proPlan.priceUsd}</span>
                                     <span className="text-muted-foreground text-lg">/60 days</span>
                                </div>
                            )}
                            <CardDescription>Unlock your full potential and land your dream job.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
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
                            {currency === 'inr' && (
                                 <div className="space-y-2 pt-4 border-t">
                                    <Label htmlFor="coupon" className="flex items-center gap-2 text-muted-foreground"><Ticket className="h-4 w-4"/> Have a coupon?</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="coupon" 
                                            placeholder="Enter FIRST1000"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            disabled={isCouponApplied}
                                        />
                                        <Button onClick={handleApplyCoupon} disabled={isCouponApplied}>
                                            {isCouponApplied ? 'Applied' : 'Apply'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handlePayment}
                                disabled={loadingPlan === proPlan.name}
                            >
                                {loadingPlan === proPlan.name ? (
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
