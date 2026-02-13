
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Video,
    CircleDollarSign,
    Heart,
    Sparkles,
    ArrowRight,
    Play,
    Share2
} from 'lucide-react';
import Link from 'next/link';

export default function LandingCreator() {
    const socialPosts = [
        {
            id: 1,
            type: 'tiktok',
            image: 'https://images.unsplash.com/photo-1593113028839-d974e4d67ad4?q=80&w=400&h=600&auto=format&fit=crop',
            caption: 'Caught my roommate using AI for her interview 😂',
            author: '@career_hacks',
            rotation: -5,
            y: 0,
            x: 0,
            zIndex: 10
        },
        {
            id: 2,
            type: 'instagram',
            image: 'https://images.unsplash.com/photo-1573164713714-d13de9422df7?q=80&w=400&h=600&auto=format&fit=crop',
            caption: 'Work smarter, not harder. This is how you win the interview.',
            author: 'talxify_ai',
            rotation: 3,
            y: -20,
            x: 30,
            zIndex: 20
        },
        {
            id: 3,
            type: 'tiktok',
            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=600&auto=format&fit=crop',
            caption: "IT'S INSANE that using AI for interviews is something people do these days 🤯",
            author: '@tech_junkie',
            rotation: -2,
            y: 40,
            x: -20,
            zIndex: 15
        },
        {
            id: 4,
            type: 'reels',
            image: 'https://images.unsplash.com/photo-1516321497487-120061e7a044?q=80&w=400&h=600&auto=format&fit=crop',
            caption: 'I have no hope for this generation... they are getting too good.',
            author: '@senior_dev',
            rotation: 5,
            y: 10,
            x: 40,
            zIndex: 25
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-transparent" id="earn-money">
            {/* Background glow - subtle red for dark theme */}
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 -z-10" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

                    {/* Left Content */}
                    <div className="flex-1 max-w-xl text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Badge className="bg-primary hover:bg-primary/90 text-white font-black px-4 py-1.5 rounded-lg mb-8 uppercase tracking-widest text-[10px] border-none">
                                Create & Earn
                            </Badge>

                            <h2 className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tight text-white mb-6 leading-[1.1]">
                                Join the <span className="text-primary">Talxify</span> Partner Network <br />
                                <span className="text-primary">Monetize</span> your tech content.
                            </h2>

                            <div className="space-y-6 mt-12 mb-12">
                                {[
                                    {
                                        icon: Video,
                                        text: "Turn your tech tips into revenue - no massive following required to start.",
                                    },
                                    {
                                        icon: CircleDollarSign,
                                        text: "Uncapped performance bonuses based on viral reach and organic engagement.",
                                    },
                                    {
                                        icon: Heart,
                                        text: "Access our creator playbook - backend strategies used for 500M+ views.",
                                    },
                                    {
                                        icon: Sparkles,
                                        text: "Build your personal brand while generating significant monthly passive income.",
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="flex items-start gap-4 group"
                                    >
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:scale-110 transition-transform">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-lg text-gray-400 font-medium leading-tight pt-1">
                                            {item.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-white font-black px-12 h-16 rounded-full text-lg group shadow-[0_0_30px_rgba(230,57,70,0.3)] hover:shadow-[0_0_40px_rgba(230,57,70,0.5)] transition-all"
                                >
                                    <Link href="/earn-money">
                                        START EARNING NOW
                                        <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </Button>
                                <p className="text-gray-500 text-xs mt-4 ml-2 font-medium">Limited spots available for Q1 Partnership Program</p>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Revenue Visualization */}
                    <div className="flex-1 w-full relative h-[600px] flex items-center justify-center">
                        <div className="relative w-full max-w-[500px] aspect-square">
                            {/* Central Glow Core */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />

                            {/* Rotating Orbitals */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                {/* Revenue Nodes */}
                                {[
                                    { text: "+$2,000", sub: "Viral Bonus", pos: "top-0 left-1/2 -translate-x-1/2", delay: 0 },
                                    { text: "+$150", sub: "Daily Stream", pos: "bottom-0 left-1/2 -translate-x-1/2", delay: 0.5 },
                                    { text: "+$500", sub: "Brand Deal", pos: "left-0 top-1/2 -translate-y-1/2", delay: 1 },
                                    { text: "+$1,200", sub: "Referral Cap", pos: "right-0 top-1/2 -translate-y-1/2", delay: 1.5 },
                                ].map((node, i) => (
                                    <motion.div
                                        key={i}
                                        className={`absolute ${node.pos} bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl`}
                                        style={{ transform: `rotate(-${i * 90}deg)` }}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-primary font-black text-xl tracking-tighter">{node.text}</span>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{node.sub}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Main Center Stat Card */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-black/60 backdrop-blur-2xl border border-primary/30 p-8 rounded-[40px] shadow-[0_0_50px_rgba(var(--primary),0.15)] z-30"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                                        <CircleDollarSign className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="text-4xl font-black text-white tracking-tighter mb-1">
                                        $4,850
                                    </span>
                                    <span className="text-xs text-primary font-black uppercase tracking-[0.2em] mb-6">
                                        Net Earnings
                                    </span>

                                    {/* Mini Progress Bars */}
                                    <div className="w-full space-y-3">
                                        {[
                                            { label: "Reach", val: "85%", color: "bg-primary" },
                                            { label: "Engagement", val: "92%", color: "bg-white" },
                                        ].map((bar, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between text-[8px] uppercase font-black text-gray-500 tracking-widest">
                                                    <span>{bar.label}</span>
                                                    <span>{bar.val}</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: bar.val }}
                                                        className={`h-full ${bar.color}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decorative Floating Icons */}
                            {[Video, Heart, Share2, Sparkles].map((Icon, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -20, 0],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{
                                        duration: 3 + i,
                                        repeat: Infinity,
                                        delay: i * 0.5
                                    }}
                                    className="absolute"
                                    style={{
                                        top: `${20 + (i * 20)}%`,
                                        left: i % 2 === 0 ? '10%' : '85%',
                                    }}
                                >
                                    <Icon className="w-6 h-6 text-primary/40" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
