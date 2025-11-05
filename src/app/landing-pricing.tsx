
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, UserRound, Sparkles, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const freePlan = {
    name: 'Free',
    price: '₹0',
    features: [
        'AI-Powered Mock Interview',
        'AI-Analyzed Coding Quiz',
        'AI-Generated Study Notes',
        'Limited Portfolio Access',
        'Limited Resume Downloads'
    ],
};

const proPlan = {
    name: 'Pro',
    originalPriceInr: '₹7999',
    priceInr: '₹6999',
    priceUsd: '$99',
    period: '/60 days',
};

const proFeatures = [
    'Unlimited Mock Interviews',
    'Unlimited Coding Questions',
    'Unlimited Study Notes',
    'Interview Question Generator',
    'Professional Resume Builder',
    'Full Portfolio Customization',
    'Detailed Performance Analytics',
    'Prep To-Do List',
    'Priority Support',
];


const AnimatedPaymentButton = () => {
    const paymentMethods = [
        { icon: <CreditCard className="w-5 h-5" />, text: 'Pay with Card' },
        { icon: <UpiLogo />, text: 'Pay with UPI' },
        { icon: <PayPalLogo />, text: 'Pay with PayPal' },
        { icon: null, text: 'Upgrade to Pro' }
    ];

    const [index, setIndex] = useState(3);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % paymentMethods.length);
        }, 2500); // Change every 2.5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Button asChild className="w-full" size="lg">
            <Link href="/signup">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-center gap-2 w-full"
                    >
                        {paymentMethods[index].icon}
                        {paymentMethods[index].text}
                    </motion.span>
                </AnimatePresence>
            </Link>
        </Button>
    );
};

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

export default function LandingPricing() {
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
                            <CardTitle className="text-3xl font-bold font-headline">{proPlan.name}</CardTitle>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-3xl font-medium text-muted-foreground line-through">{proPlan.originalPriceInr}</span>
                                <span className="text-5xl font-bold tracking-tighter">{proPlan.priceInr}</span>
                                <span className="text-muted-foreground">{proPlan.period}</span>
                            </div>
                            <CardDescription>Unlock your full potential and land your dream job.</CardDescription>
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
                        </CardContent>
                        <CardFooter>
                             <AnimatedPaymentButton />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    );
}
