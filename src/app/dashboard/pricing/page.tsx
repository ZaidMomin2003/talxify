
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, UserRound, Sparkles, Info, Ticket, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';


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
    priceInr: 7999,
    discountedPriceInr: 6999,
    priceUsd: 99,
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

const UpiLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.233 18.003L12.56 16.677L11.233 15.35C11.022 15.139 10.852 14.898 10.732 14.63C10.612 14.362 10.545 14.07 10.533 13.774V6.23C10.545 5.934 10.612 5.642 10.732 5.374C10.852 5.106 11.022 4.865 11.233 4.654L12.56 3.328L11.233 2.002L9.227 4.008C8.755 4.48 8.411 5.064 8.233 5.71V14.293C8.411 14.939 8.755 15.523 9.227 16.001L11.233 18.003Z" fill="#FB9B33"/>
        <path d="M12.769 18.003L14.775 16.001C15.247 15.529 15.591 14.945 15.769 14.299V5.716C15.591 5.07 15.247 4.486 14.775 4.014L12.769 2.002L14.1 0.675L17.42 4.001C18.332 4.913 18.841 6.136 18.845 7.414V12.583C18.841 13.861 18.332 15.084 17.42 16L14.1 19.326L12.769 18.003Z" fill="#026E52"/>
        <path d="M10.533 13.774V6.23C10.533 5.043 10.024 3.905 9.141 3.022L8.533 2.414L7.207 3.74L7.815 4.348C8.085 4.618 8.287 4.945 8.407 5.303C8.527 5.661 8.565 6.043 8.519 6.42V13.58C8.565 13.958 8.527 14.339 8.407 14.697C8.287 15.055 8.085 15.382 7.815 15.652L7.207 16.26L8.533 17.586L9.141 16.978C10.024 16.095 10.533 14.957 10.533 13.774Z" fill="#FB9B33"/>
        <path d="M16.484 13.58V6.42C16.438 6.042 16.4 5.661 16.28 5.303C16.16 4.945 15.958 4.618 15.688 4.348L15.08 3.74L13.754 2.414L14.362 3.022C15.245 3.905 15.754 5.043 15.754 6.23V13.774C15.754 14.961 15.245 16.103 14.362 16.982L13.754 17.586L15.08 18.912L15.688 18.304C15.958 18.034 16.16 17.707 16.28 17.349C16.4 16.991 16.438 16.609 16.484 16.231V13.58Z" fill="#026E52"/>
    </svg>
);

const PayPalLogo = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="#0070BA" d="M16.742 6.278h-5.604c-.39 0-.728.39-.728.845l-1.457 9.075c-.065.455.26.715.65.715h3.445c.39 0 .728-.39.728-.845l.39-2.535.065-.39c.065-.455.39-.845.793-.845h.325a.855.855 0 0 0 .845-.715l.845-5.33c.065-.455-.26-.715-.65-.715z"/>
        <path fill="#0093E4" d="M19.337 7.962l-.39 2.535a.855.855 0 0 1-.845.715h-.325c-.39 0-.728.39-.793.845l-.455 2.925c-.065.455.26.715.65.715h2.275c.39 0 .715-.325.793-.715l.91-5.72a.65.65 0 0 0-.65-.78z"/>
        <path fill="#0070BA" d="M20.312 7.147h-5.604c-.39 0-.728.39-.728.845L13.525 11a.65.65 0 0 0 .65.78h.325c.39 0 .728-.39.793-.845l.39-2.535c.065-.455.39-.845.793-.845h3.185c.39 0 .715-.325.65-.715z"/>
    </svg>
);


const AnimatedPaymentButton = ({ onClick, disabled, currency }: { onClick: () => void, disabled: boolean, currency: string }) => {
    const paymentMethods = currency === 'inr' 
        ? [
            { icon: <CreditCard className="w-5 h-5" />, text: 'Pay with Card' },
            { icon: <UpiLogo />, text: 'Pay with UPI' },
            { icon: null, text: 'Upgrade to Pro' }
          ]
        : [
            { icon: <PayPalLogo />, text: 'Pay with PayPal' },
            { icon: null, text: 'Upgrade to Pro' }
        ];

    const [index, setIndex] = useState(paymentMethods.length - 1);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % paymentMethods.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [paymentMethods.length]);

    return (
        <Button onClick={onClick} className="w-full" size="lg" disabled={disabled}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center gap-2 w-full"
                >
                    {disabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : paymentMethods[index].icon}
                    {disabled ? 'Processing...' : paymentMethods[index].text}
                </motion.span>
            </AnimatePresence>
        </Button>
    );
};

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

    const handleRazorpayPayment = async () => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to make a purchase.", variant: "destructive" });
            return;
        }

        setLoadingPlan('razorpay');

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

    const handlePaypalPayment = async () => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setLoadingPlan('paypal');
        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: proPlan.priceUsd }),
            });

            const order = await response.json();
            if (order.id) {
                // We need to set the custom_id on the server when creating the order
                // For now, this will just redirect
                window.location.href = order.links.find((link: any) => link.rel === 'approve').href;
            } else {
                throw new Error(order.error || 'Failed to create PayPal order.');
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: "PayPal Error", description: error.message, variant: "destructive" });
        } finally {
            setLoadingPlan(null);
        }
    }

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
                                            placeholder="Enter coupon code"
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
                        <CardFooter className="flex-col gap-6">
                             <div className="w-full">
                                <AnimatedPaymentButton 
                                    onClick={currency === 'inr' ? handleRazorpayPayment : handlePaypalPayment} 
                                    disabled={!!loadingPlan}
                                    currency={currency}
                                />
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </>
    );
}
