
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingHeader from '../landing-header';
import LandingFooter from '../landing-footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Edit, Headset, Percent, Handshake, Users, CheckCircle, Wallet, Rocket, ShieldCheck, TrendingUp, Sparkles, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CalEmbed from './cal-embed';


const steps = [
    {
        icon: Rocket,
        title: 'Apply Now',
        description: "Submit your partnership request. We're looking for passionate creators and student leaders."
    },
    {
        icon: Handshake,
        title: 'Strategic Sync',
        description: "Quick 15-min call with our team to align on strategy and provide you with high-converting assets."
    },
    {
        icon: Wallet,
        title: 'Earn ₹1000/Sale',
        description: "Get your unique protocol code. Earn ₹1000 for every Pro user you bring into the Talxify ecosystem."
    }
];

const benefits = [
    { icon: DollarSign, title: 'High Commissions', text: '₹1000 per sale—one of the highest in the EdTech space.' },
    { icon: TrendingUp, title: 'Passive Revenue', text: 'Build a recurring income stream by helping your network grow.' },
    { icon: ShieldCheck, title: 'Trusted Brand', text: 'Promote a premium tool that actually helps developers land jobs.' },
    { icon: Sparkles, title: 'Priority Access', text: 'Get first look at new AI features and beta-test upcoming tools.' },
];

const faqs = [
    {
        question: "What is the commission per sale?",
        answer: "You will earn a flat rate of ₹1000 INR for every single customer who signs up for our Pro plan using your unique affiliate code. There is no limit to how much you can earn."
    },
    {
        question: "How and when do I get paid?",
        answer: "We process payments through bank transfer or UPI. Once you've made a successful referral, you can request a payout from your affiliate dashboard. Payouts are typically processed within 24 hours of your request."
    },
    {
        question: "Who is the ideal customer for Talxify?",
        answer: "Talxify is perfect for computer science students, recent graduates, and professional developers who are preparing for technical interviews at top tech companies. Anyone looking to improve their interview skills can benefit."
    },
    {
        question: "Are there any costs to join the affiliate program?",
        answer: "No, the Talxify affiliate program is completely free to join. There are no hidden fees or charges. Our goal is to partner with individuals who are passionate about helping others succeed in their tech careers."
    }
];

export default function EarnMoneyPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Application Submitted!",
            description: "Thank you for your interest. We will review your application and get back to you shortly.",
        });
        // In a real app, you would handle form submission to a backend here.
        (e.target as HTMLFormElement).reset();
    }

    return (
        <div className="bg-background min-h-screen text-foreground">
            <LandingHeader />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 sm:pt-40 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 md:px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <Badge variant="outline" className="mb-6 px-4 py-1 border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">
                            Wealth Acceleration
                        </Badge>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 leading-[0.8] text-foreground">
                            Earn and <br /> <span className="text-primary">Empower.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg sm:text-2xl font-medium italic text-muted-foreground leading-relaxed mb-10">
                            Partner with the world's most advanced AI interview platform and unlock high-ticket commissions for every professional you refer.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-primary hover:scale-105 transition-all font-black uppercase tracking-widest italic text-base shadow-2xl shadow-primary/30">
                                <a href="#schedule-call">Join the Elite</a>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 font-black uppercase tracking-widest italic text-base">
                                <a href="#how-it-works">The Protocol <ArrowRight className="ml-2 h-4 w-4" /></a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <main className="container mx-auto max-w-6xl p-4 md:p-6 lg:p-8 space-y-24">

                {/* Commission Spotlight */}
                <section className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto rounded-[3.5rem] border border-primary/20 bg-primary/5 dark:bg-black/50 backdrop-blur-3xl p-10 md:p-16 shadow-2xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <TrendingUp size={300} className="text-primary" />
                        </div>

                        <div className="relative z-10 text-center space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Signature Commission</span>
                            <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight text-foreground">Earn a flat commission of</h2>
                            <div className="relative inline-block">
                                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50" />
                                <p className="text-8xl sm:text-9xl font-black italic uppercase tracking-tighter text-primary leading-none relative">₹1000</p>
                            </div>
                            <p className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-foreground">Per every single pro sale.</p>
                            <div className="pt-6">
                                <Badge variant="outline" className="px-6 py-2 border-primary/20 bg-background/50 rounded-full text-sm font-bold italic text-muted-foreground uppercase tracking-widest">
                                    No Earnings Cap • Instant Payouts Available
                                </Badge>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
                        >
                            <Send size={14} className="fill-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">The Execution Path</span>
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 text-foreground">Simple <span className="text-primary">Onboarding.</span></h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto font-medium italic">Execute these three moves to begin your revenue generation journey.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex flex-col items-center text-center p-8 rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:border-primary/30"
                            >
                                <div className="z-10 flex items-center justify-center h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 shadow-lg mb-6 group-hover:scale-110 transition-transform">
                                    <step.icon className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground mb-3 leading-none">{step.title}</h3>
                                <p className="text-muted-foreground font-medium italic text-sm">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Benefits Grid */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto pt-4">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="rounded-[2rem] border border-border/50 dark:border-white/10 bg-card/20 dark:bg-white/[0.02] p-8 text-center backdrop-blur-md relative group hover:bg-card/40 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 border border-primary/20 group-hover:rotate-6 transition-transform">
                                    <benefit.icon className="h-6 w-6" />
                                </div>
                                <h4 className="text-lg font-black italic uppercase tracking-tighter text-foreground mb-2 leading-none">{benefit.title}</h4>
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">{benefit.text}</p>
                                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
                        >
                            <ShieldCheck size={14} className="fill-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Knowledge Base</span>
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 text-foreground">Common <span className="text-primary">Queries.</span></h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto font-medium italic">Everything you need to know about the partnership infrastructure.</p>
                    </div>
                    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-border/50">
                                <AccordionTrigger className="text-xl font-black italic uppercase tracking-tighter text-left hover:text-primary transition-colors">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-lg font-medium italic text-muted-foreground leading-relaxed pl-2 border-l border-primary/20 mt-2">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </section>

                {/* Calendly Embed Section */}
                <section id="schedule-call">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
                        >
                            <Headset size={14} className="fill-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Strategic Deep-Dive</span>
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 text-foreground">Ready to <span className="text-primary">Launch?</span></h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto font-medium italic">Schedule a tactical briefing with our partnership team to activate your affiliate code.</p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="max-w-5xl mx-auto shadow-[0_0_50px_rgba(var(--primary),0.1)] overflow-hidden rounded-[3.5rem] border border-border/50 bg-card/40 dark:bg-black/50 backdrop-blur-3xl p-1">
                            <CardContent className="p-0 h-[700px] rounded-[3.4rem] overflow-hidden">
                                <CalEmbed />
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>

            </main>

            <LandingFooter />
        </div>
    );
}
