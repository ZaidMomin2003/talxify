'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Bot, Sparkles, MessageSquare, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AppHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge / Pill */}
          <motion.div variants={itemVariants} className="mb-12">
            <Link href="/#features" className="group flex items-center gap-4 bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-3xl border border-white/5 rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-500 shadow-2xl hover:border-white/10 ring-1 ring-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-white transition-colors italic">
                Advanced AI Intelligence v.2.0
              </span>
              <div className="bg-primary rounded-full p-2.5 shadow-lg shadow-primary/20 group-hover:scale-110 active:scale-95 transition-all duration-500 flex items-center justify-center">
                <ArrowRight size={14} className="text-white" />
              </div>
            </Link>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05]"
          >
            Master Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-primary animate-gradient-x">
              Tech Interview.
            </span>
          </motion.h1>

          {/* Subheader */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed"
          >
            Practice with an ultra-realistic AI that hears, speaks, and analyzes your performance in real-time. Stop guessing and start landing offers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full"
          >
            <Button asChild size="lg" className="h-16 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-[0_0_30px_rgba(230,57,70,0.4)] group transition-all w-full sm:w-auto">
              <Link href="/signup">
                Start Practicing Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full bg-white/5 border-white/10 hover:bg-white/10 font-bold text-lg backdrop-blur-md w-full sm:w-auto">
              <Link href="/#pricing" className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Pricing
              </Link>
            </Button>
          </motion.div>

          {/* Features Grid (Mini) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-6xl"
          >
            {[
              { icon: Bot, label: "Human Like interview", sub: "Realistic Voice AI" },
              { icon: MessageSquare, label: "Coding quiz", sub: "Interactive Challenges" },
              { icon: Zap, label: "Notes and questions generator", sub: "AI Smart Prep" },
              { icon: Trophy, label: "portfolio and resume builder", sub: "Career Toolkit" }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:border-primary/30 transition-colors h-full justify-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(230,57,70,0.1)]">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground leading-tight px-1 capitalize tracking-tight">{feature.label}</h3>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-2.5 opacity-60">{feature.sub}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[10%] w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] -z-10" />
    </section>
  );
}

const Trophy = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
