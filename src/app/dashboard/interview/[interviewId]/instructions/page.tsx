
'use client';

import React, { useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, MessageSquare, Bot, ArrowRight, Video, Building, Sparkles, Wifi, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { interviewerPersonalities, type InterviewerPersonality } from '@/lib/interviewer-personalities';
import { Badge } from '@/components/ui/badge';

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
};

export default function InterviewInstructionsPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();

    const interviewId = params.interviewId as string;
    const topic = searchParams.get('topic') || 'Not specified';
    const role = searchParams.get('role');
    const level = searchParams.get('level');

    const [company, setCompany] = useState(searchParams.get('company') || '');
    const [characterId, setCharacterId] = useState<string>(interviewerPersonalities[0].id);
    const [isNavigating, setIsNavigating] = useState(false);

    const handleStart = () => {
        setIsNavigating(true);
        const startUrl = new URLSearchParams({
            topic,
            role: role || '',
            level: level || '',
            company,
            character: characterId,
        });
        router.push(`/dashboard/interview/${interviewId}?${startUrl.toString()}`);
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-4xl mx-auto space-y-10 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="text-center space-y-4">
                    <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-2">
                        <MessageSquare className="h-10 w-10 text-primary" />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black tracking-tight italic uppercase text-white leading-none">
                        Interview <span className="text-primary">Briefing</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground text-lg font-medium">
                        Synchronizing with AI assessment logic. Treatment as high-stakes industrial evaluation required.
                    </motion.p>
                </div>

                <motion.div variants={itemVariants}>
                    <Card className="rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                        <CardHeader className="p-8 md:p-10 border-b border-white/5 bg-white/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <Building className="w-6 h-6 text-primary" />
                                        Deployment Setup
                                    </CardTitle>
                                    <CardDescription className="text-base mt-2">Adjust mission parameters for target organization.</CardDescription>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="h-8 px-4 rounded-lg font-black uppercase text-[10px] tracking-widest bg-white/5 border-white/10">
                                        {topic}
                                    </Badge>
                                    {role && (
                                        <Badge variant="outline" className="h-8 px-4 rounded-lg font-black uppercase text-[10px] tracking-widest border-primary/30 text-primary">
                                            {role}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-3">
                                    <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                        <Building className="w-4 h-4 text-primary" />
                                        Target Organization
                                    </Label>
                                    <Input
                                        id="company"
                                        placeholder="e.g., Google, Amazon"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="bg-black/20 border-white/5 h-14 focus:ring-primary/20 rounded-2xl text-lg px-6"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="character" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" />
                                        Interviewer Personality
                                    </Label>
                                    <Select value={characterId} onValueChange={setCharacterId}>
                                        <SelectTrigger id="character" className="bg-black/20 border-white/5 h-14 focus:ring-primary/20 rounded-2xl text-lg px-6">
                                            <SelectValue placeholder="Select a character" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                                            {interviewerPersonalities.map(char => (
                                                <SelectItem key={char.id} value={char.id} className="py-3">
                                                    <span className="font-bold">{char.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">({char.description})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-4">
                                    <span className="h-px bg-primary/20 flex-1"></span>
                                    Operational Protocols
                                    <span className="h-px bg-primary/20 flex-1"></span>
                                </h3>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <ProtocolItem
                                        icon={<Bot className="h-5 w-5" />}
                                        title="AI SYNTHESIS"
                                        desc="Native neural processing of technical and behavioral responses."
                                    />
                                    <ProtocolItem
                                        icon={<Video className="h-5 w-5" />}
                                        title="OPTIC & AUDIO"
                                        desc="Live monitoring via camera and mic for full behavioral analysis."
                                    />
                                    <ProtocolItem
                                        icon={<Wifi className="h-5 w-5" />}
                                        title="UPLINK STABILITY"
                                        desc="Stable connection mandatory. Session interruptions result in termination."
                                        variant="destructive"
                                    />
                                    <ProtocolItem
                                        icon={<ShieldCheck className="h-5 w-5" />}
                                        title="ELITE CONDUCT"
                                        desc="Maintain zero-latency professionalism and structured reasoning."
                                    />
                                    <ProtocolItem
                                        icon={<Sparkles className="h-5 w-5" />}
                                        title="DETAILED OUTPUT"
                                        desc="Detailed telemetry required for high-precision performance score."
                                    />
                                    <ProtocolItem
                                        icon={<ArrowRight className="h-5 w-5" />}
                                        title="READY STATUS"
                                        desc="Initiate session when operational readiness is confirmed."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-center">
                                <Button
                                    onClick={handleStart}
                                    size="lg"
                                    disabled={isNavigating}
                                    className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-sm italic shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all min-w-[280px]"
                                >
                                    {isNavigating ? (
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            Engage Interview
                                            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </main>
    );
}

function ProtocolItem({ icon, title, desc, variant = 'primary' }: { icon: React.ReactNode, title: string, desc: string, variant?: 'primary' | 'destructive' }) {
    return (
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                variant === 'primary' ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"
            )}>
                {icon}
            </div>
            <div className="space-y-1">
                <h4 className="font-black text-[10px] tracking-widest uppercase text-white/90">{title}</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

