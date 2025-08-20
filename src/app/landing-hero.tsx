
'use client';

import { useEffect, useState } from 'react';
import { easeInOut, motion, spring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart,
  BrainCircuit,
  Code,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ParticleEffects = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 opacity-20">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute h-1 w-1 rounded-full bg-white"
          style={{
            top: particle.top,
            left: particle.left,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};


export default function LandingHero() {
  // State for animated counters
  const [stats, setStats] = useState({
    users: 0,
    interviews: 0,
    problems: 0,
  });

  // Animation to count up numbers
  useEffect(() => {
    const intervals = [
      setInterval(() => setStats(prev => ({ ...prev, users: Math.min(500, prev.users + 13) })), 50),
      setInterval(() => setStats(prev => ({ ...prev, interviews: Math.min(8000, prev.interviews + 200) })), 50),
      setInterval(() => setStats(prev => ({ ...prev, problems: Math.min(18000, prev.problems + 450) })), 50),
    ];
    
    setTimeout(() => intervals.forEach(clearInterval), 2000); // Stop after 2 seconds

    return () => intervals.forEach(clearInterval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: spring, stiffness: 100 },
    },
  };

  // Glowing effect animation
  const glowAnimation = {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easeInOut,
    },
  };

  // Tooltip animation
  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: spring,
        stiffness: 100,
        delay: 1.2,
      },
    },
  };
  
    const socialProofUsers = [
        "https://randomuser.me/api/portraits/women/68.jpg",
        "https://randomuser.me/api/portraits/men/75.jpg",
        "https://randomuser.me/api/portraits/women/79.jpg",
        "https://randomuser.me/api/portraits/men/55.jpg",
        "https://randomuser.me/api/portraits/women/56.jpg",
    ]

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background py-16 text-white sm:px-6 lg:px-8 lg:py-2">
      <div className="absolute inset-0 z-0 h-full w-full rotate-180 items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,transparent_40%,hsl(var(--primary))_100%)] opacity-30"></div>
      
      {/* Main Content Area */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-7xl flex-grow flex-col items-center justify-center px-4 text-center"
      >
        <motion.div
            variants={itemVariants}
            className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary"
        >
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            New
            </span>
            Introducing Talxify Platform
        </motion.div>

        <motion.h1
            variants={itemVariants}
            className="mb-6 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
            Win your interviews <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            with AI Assistance
            </span>
        </motion.h1>

        <motion.p
            variants={itemVariants}
            className="mb-8 max-w-2xl px-6 text-center text-lg leading-relaxed text-muted-foreground"
        >
            Talxify connects you with AI-powered tools to practice mock interviews, sharpen your coding skills, and analyze your performance. Land your dream job, faster.
        </motion.p>
        
        <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-col flex-wrap gap-4 sm:flex-row lg:justify-end"
        >
            <Button asChild
            className="group rounded-full px-6 py-6 text-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40"
            size="lg"
            >
            <Link href="/signup">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            </Button>
        </motion.div>

         {/* Social proof */}
        <motion.div
            variants={itemVariants}
            className="mx-auto flex items-center gap-3"
        >
            <div className="flex -space-x-2">
            {socialProofUsers.map((src, i) => (
                <Image
                    key={i}
                    src={src}
                    alt={`user ${i + 1}`}
                    width={24}
                    height={24}
                    className="h-6 w-6 overflow-hidden rounded-full border-2 border-background"
                />
            ))}
            </div>
            <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">500+</span>{' '}
            developers already preparing
            </span>
        </motion.div>
      </motion.main>
    </section>
  );
}
