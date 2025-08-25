
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Bot, BrainCircuit, Code, FileText, Loader2, Mail, MessageSquare, CheckCircle, User, Edit } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { saveWaitlistSubmission } from '@/lib/firebase-service';
import LandingFooter from '../landing-footer';

const features = [
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'Conversational AI Interviews',
    description: 'Practice with an AI that adapts to your responses, asks relevant follow-up questions, and mimics a real interview flow.',
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: 'AI-Powered Coding Gym',
    description: 'Solve problems and get instant, line-by-line feedback on your code, explanations of optimal solutions, and performance analysis.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8" />,
    title: 'Targeted Prep Tracks',
    description: 'Choose a company like Google or Amazon, and get a personalized 30-day syllabus and mock interviews tailored to their style.',
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: 'Automated Portfolio & Resume',
    description: 'Showcase your skills with a professional resume and a portfolio that automatically updates with your interview and quiz results.',
  },
];

const WaitlistForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveWaitlistSubmission({ name, email });
            setSubmitted(true);
        } catch (error) {
            toast({ title: "Submission Failed", description: "Could not save your details. Please try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold">You're on the list!</h3>
                <p className="text-muted-foreground">Thank you for joining. We'll notify you as soon as we launch.</p>
            </motion.div>
        )
    }
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg mx-auto">
            <div className="relative w-full">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Your Name" required className="pl-10 h-12 text-base" />
            </div>
            <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Your Email" required className="pl-10 h-12 text-base" />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto h-12 shrink-0" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Join Waitlist"}
            </Button>
        </form>
    )
}

export default function WaitlistPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
                <Bot className="w-8 h-8 text-primary"/>
                <span className="text-xl font-bold font-headline">Talxify</span>
            </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative pt-32 pb-20 text-center overflow-hidden">
             <div className="absolute inset-0 z-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#3F51B5_100%)] opacity-20"></div>
             <div className="container mx-auto px-4 relative z-10">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight mb-4"
                >
                    The Future of Interview Prep is Here
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10"
                >
                    Stop guessing. Start preparing with an AI that knows what it takes to get hired. Join our waitlist for exclusive early access and discounts.
                </motion.p>
                <motion.div
                     initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <WaitlistForm />
                </motion.div>
             </div>
        </section>

        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center p-6"
                        >
                            <div className="flex justify-center items-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold font-headline mb-4">Help Us Build for You</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                        Your feedback is critical. Take our 2-minute survey to tell us what you need most in an interview prep tool. Your insights will directly shape our product.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/survey">
                            Take the Survey <Edit className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
