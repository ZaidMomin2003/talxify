
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
        name: 'Essential',
        priceInr: 999,
        priceUsd: 14,
        duration: '1 Month',
        description: 'Perfect for a focused prep sprint.',
        interviews: 5,
    },
    {
        id: 'pro-2m' as SubscriptionPlan,
        name: 'Professional',
        priceInr: 1799,
        priceUsd: 24,
        duration: '1 Month',
        description: 'Balanced plan for steady preparation.',
        interviews: 15,
    },
    {
        id: 'pro-3m' as SubscriptionPlan,
        name: 'Elite',
        priceInr: 2499,
        priceUsd: 34,
        duration: '1 Month',
        description: 'Best value for in-depth mastery.',
        interviews: 25,
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


export default function LandingPricing() {
    const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan>('pro-2m');
    const [region, setRegion] = useState<'india' | 'international'>('international');
    const selectedPlan = proPlans.find(p => p.id === selectedPlanId);

    return (
        <section className="py-12 sm:py-20 relative" id="pricing">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="relative mx-auto mb-10 max-w-3xl sm:text-center space-y-3">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
                    >
                        <Sparkles size={14} className="fill-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Simple Pricing</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-black tracking-tight italic uppercase md:text-4xl lg:text-5xl text-foreground leading-[0.9]"
                    >
                        Plans for <span className="text-primary">Every Budget.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-sm sm:text-base font-medium max-w-xl mx-auto italic"
                    >
                        Choose the perfect plan to boost your interview prep and land your dream job.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="pt-4 flex justify-center"
                    >
                        <Tabs defaultValue="international" onValueChange={(v) => setRegion(v as any)} className="w-[300px]">
                            <TabsList className="grid w-full grid-cols-2 rounded-[1rem] bg-muted/50 p-1 border border-border/50">
                                <TabsTrigger value="india" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary font-black uppercase tracking-widest text-[10px] italic">🇮🇳 Domsetic</TabsTrigger>
                                <TabsTrigger value="international" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary font-black uppercase tracking-widest text-[10px] italic flex items-center gap-2">
                                    <Globe className="w-3 h-3" />
                                    Global
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 max-w-7xl mx-auto items-stretch gap-8">
                    {/* Free Plan */}
                    <Card className="flex flex-col rounded-[2rem] border-border dark:border-white/10 bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:scale-[1.02] lg:col-span-1 h-full overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                            <UserRound size={120} />
                        </div>
                        <CardHeader className="text-center pt-10 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-muted dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-border/50">
                                <UserRound className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-foreground">{freePlan.name}</CardTitle>
                            <div className="flex items-baseline justify-center gap-1 mt-2">
                                <span className="text-5xl font-black italic tracking-tighter text-foreground">
                                    {region === 'india' ? freePlan.priceInr : freePlan.priceUsd}
                                </span>
                            </div>
                            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2 italic opacity-60">Begin for Free</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow pt-6 relative z-10">
                            <ul className="space-y-3">
                                {freePlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <div className="bg-muted dark:bg-white/5 text-muted-foreground rounded-lg p-1 border border-border/50">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground italic">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="pb-10 relative z-10">
                            <Button asChild className="w-full h-14 rounded-2xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-all font-black uppercase tracking-widest italic" variant="secondary">
                                <Link href="/signup">Start Free</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plans */}
                    <div className="lg:col-span-3 h-full">
                        <Card className="rounded-[2rem] border-primary/30 dark:border-primary/20 bg-card/60 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(var(--primary),0.05)] h-full flex flex-col relative">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none overflow-hidden h-full w-full">
                                <Star size={240} className="fill-primary absolute -top-10 -right-10 whitespace-nowrap" />
                            </div>
                            <CardHeader className="pt-8">
                                <div className="flex justify-center items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                        <Star className="w-4 h-4 fill-primary" />
                                    </div>
                                    <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none">Pro <span className="text-primary">Experience</span></CardTitle>
                                </div>
                                <CardDescription className="text-center text-muted-foreground text-xs font-medium italic max-w-md mx-auto">Get realistic AI mock interviews and full career tools.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-grow px-6 sm:px-10">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {proPlans.map((plan) => (
                                        <motion.div
                                            key={plan.id}
                                            whileHover={{ y: -2 }}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={cn(
                                                "relative rounded-[1.5rem] border p-5 cursor-pointer transition-all duration-500",
                                                selectedPlanId === plan.id
                                                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                                                    : "border-border/50 bg-muted/30 hover:bg-muted/50 opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            {(region === 'india' ? plan.badgeInr : plan.badgeUsd) && (
                                                <div className="absolute top-0 right-3 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full italic shadow-lg z-20">
                                                    {region === 'india' ? plan.badgeInr : plan.badgeUsd}
                                                </div>
                                            )}
                                            <p className={cn(
                                                "text-[10px] font-black uppercase tracking-widest italic mb-2",
                                                selectedPlanId === plan.id ? "text-primary" : "text-muted-foreground"
                                            )}>{plan.duration}</p>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black italic tracking-tighter text-foreground">
                                                        {region === 'india' ? `₹${plan.priceInr.toLocaleString('en-IN')}` : `$${plan.priceUsd}`}
                                                    </span>
                                                    {(region === 'india' ? plan.originalPriceInr : plan.originalPriceUsd) && (
                                                        <span className="text-muted-foreground line-through text-xs italic font-bold">
                                                            {region === 'india' ? `₹${plan.originalPriceInr?.toLocaleString('en-IN')}` : `$${plan.originalPriceUsd}`}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{plan.description}</p>
                                            </div>

                                            {selectedPlanId === plan.id && (
                                                <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-primary/50 pointer-events-none" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="relative pt-4">
                                    <div className="relative bg-muted/20 dark:bg-white/[0.02] border border-border/50 rounded-[1.5rem] p-5 sm:p-6">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary italic mb-4 text-center">Premium Hub Features</p>
                                        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                                            <li className="flex items-start gap-2">
                                                <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                                <span className="text-[11px] font-black italic uppercase tracking-tight text-foreground/90 leading-tight">
                                                    {proPlans.find(p => p.id === selectedPlanId)?.interviews} AI Mock Interviews
                                                </span>
                                            </li>
                                            {proFeatures.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </div>
                                                    <span className="text-[11px] font-black italic uppercase tracking-tight text-foreground/90 leading-tight">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pb-8 px-6 sm:px-10">
                                <Button asChild className="w-full h-14 rounded-xl bg-primary hover:scale-[1.01] transition-all font-black uppercase tracking-widest italic text-base shadow-lg shadow-primary/20 group" size="lg">
                                    <Link href="/signup">
                                        <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                                        Get Pro Access
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </section >
    );
}
