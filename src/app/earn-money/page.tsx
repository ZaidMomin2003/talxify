
'use client';

import React from 'react';
import LandingHeader from '../landing-header';
import LandingFooter from '../landing-footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Edit, Headset, Percent, Handshake, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';


const steps = [
    {
        icon: Edit,
        title: '1. Sign Up',
        description: "Fill out the simple form below with your details. Let us know why you'd be a great partner for Talxify."
    },
    {
        icon: Headset,
        title: '2. Connect With Us',
        description: "Our partnership team will review your application and reach out to schedule a brief call to discuss the program and answer your questions."
    },
    {
        icon: Percent,
        title: '3. Get Your Code & Earn',
        description: "Once approved, you'll receive a unique affiliate code. Share it with your network and earn ₹1000 INR for every new Pro user who signs up with your code."
    }
];

const benefits = [
    { icon: DollarSign, text: 'Generous commission on every sale.' },
    { icon: Handshake, text: 'Partner with a growing EdTech brand.' },
    { icon: Users, text: 'Empower students and professionals in your network.' },
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
            <section className="relative bg-primary/5 pt-24 pb-20 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background/80 to-background opacity-70"></div>
                <div className="container mx-auto max-w-4xl px-4 md:px-6 relative py-12">
                    <div className="mx-auto w-fit p-4 bg-primary/10 text-primary rounded-full mb-4">
                        <DollarSign className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold mb-4 tracking-tighter">Become a Talxify Affiliate</h1>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                        Join our mission to empower the next generation of tech talent and earn for every new user you bring to our Pro plan.
                    </p>
                </div>
            </section>

            <main className="container mx-auto max-w-6xl p-4 md:p-6 lg:p-8 space-y-24">

                 {/* Commission Highlight */}
                <section className="text-center">
                    <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/80 to-blue-500/80 text-primary-foreground shadow-2xl shadow-primary/20 p-8">
                        <p className="text-2xl font-semibold">Earn a commission of</p>
                        <p className="text-7xl font-bold tracking-tighter my-2">₹1000 INR</p>
                        <p className="text-xl font-semibold">for every single Pro plan sale you refer.</p>
                    </Card>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">A Simple 3-Step Process</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Getting started as a Talxify affiliate is quick and easy.</p>
                    </div>
                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="absolute top-8 left-0 w-full h-px bg-border hidden md:block"></div>
                        
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center">
                                <div className="relative z-10 flex items-center justify-center h-16 w-16 rounded-full bg-background border-2 border-primary shadow-lg mb-6">
                                    <step.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits Section */}
                <section>
                    <div className="max-w-3xl mx-auto">
                        <ul className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex-shrink-0 bg-green-500/10 text-green-500 p-3 rounded-full">
                                         <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <span className="text-lg font-medium">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                 {/* Sign-up Form Section */}
                <section id="signup-form">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">Join the Affiliate Program</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Fill out the form below to start your application.</p>
                    </div>
                     <Card className="max-w-2xl mx-auto shadow-lg">
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" placeholder="John Doe" required />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" placeholder="john.doe@example.com" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone / WhatsApp (Optional)</Label>
                                    <Input id="phone" placeholder="+91 12345 67890" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="about">Tell us about yourself</Label>
                                    <textarea id="about" placeholder="Why are you interested in becoming a Talxify affiliate? (Optional)" className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" size="lg" className="w-full">
                                        Submit Application
                                        <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
