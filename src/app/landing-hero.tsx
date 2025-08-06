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


export default function LandingHero() {
  const [stats, setStats] = useState({
    users: 0,
    interviews: 0,
    questions: 0,
  });

  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        const newUsers = prev.users >= 5000 ? 5000 : prev.users + 125;
        const newInterviews = prev.interviews >= 10000 ? 10000 : prev.interviews + 250;
        const newQuestions = prev.questions >= 25000 ? 25000 : prev.questions + 625;

        if (
          newUsers === 5000 &&
          newInterviews === 10000 &&
          newQuestions === 25000
        ) {
          clearInterval(interval);
        }

        return {
          users: newUsers,
          interviews: newInterviews,
          questions: newQuestions,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

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

  const glowAnimation = {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easeInOut,
    },
  };

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

  return (
    <section className="relative w-full flex flex-col items-center overflow-hidden bg-black py-16 text-white sm:px-6 lg:px-8 lg:py-20">
      <div className="absolute inset-0 z-0 h-full w-full rotate-180 items-center px-5 py-24 opacity-80 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <svg
        id="noice"
        className="absolute inset-0 z-10 h-full w-full opacity-30"
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.34"
            numOctaves="4"
            stitchTiles="stitch"
          ></feTurbulence>
          <feColorMatrix type="saturate" values="0"></feColorMatrix>
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.46"></feFuncR>
            <feFuncG type="linear" slope="0.46"></feFuncG>
            <feFuncB type="linear" slope="0.47"></feFuncB>
            <feFuncA type="linear" slope="0.37"></feFuncA>
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.47" intercept="-0.23" />
            <feFuncG type="linear" slope="1.47" intercept="-0.23" />
            <feFuncB type="linear" slope="1.47" intercept="-0.23" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)"></rect>
      </svg>
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        {/* Enhanced glow spots */}
        <div className="absolute top-20 -left-20 h-60 w-60 rounded-full bg-purple-600/20 blur-[100px]"></div>
        <div className="absolute -right-20 bottom-20 h-60 w-60 rounded-full bg-blue-600/20 blur-[100px]"></div>
        <motion.div
          animate={glowAnimation}
          className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-indigo-500/10 blur-[80px]"
        ></motion.div>
        <motion.div
          animate={glowAnimation}
          className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full bg-purple-500/10 blur-[80px]"
        ></motion.div>

        {/* Particle effects - subtle dots */}
        <div className="absolute inset-0 opacity-20">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
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
      </div>

      {/* Main Content Area */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-7xl flex-grow flex-col items-center justify-center px-4 text-center"
      >
        <motion.div variants={itemVariants} className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm text-purple-300">
            <span className="mr-2 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-semibold text-white">
            New
            </span>
            Introducing Talxify Platform
        </motion.div>
        
        <motion.h1
            variants={itemVariants}
            className="mb-6 max-w-4xl bg-gradient-to-r from-white/70 via-white to-slate-500/80 bg-clip-text text-5xl font-bold leading-tight text-transparent md:text-6xl lg:text-7xl"
        >
            Win your interviews <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            with AI Assistance
            </span>
        </motion.h1>

        <motion.p
            variants={itemVariants}
            className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-300/90"
        >
            Talxify connects you with AI-powered tools to practice mock interviews, sharpen your coding skills, and analyze your performance. Land your dream job, faster.
        </motion.p>
        
        <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-col flex-wrap gap-4 sm:flex-row"
        >
            <Button asChild
            className="group rounded-full border-t border-purple-400 bg-gradient-to-b from-purple-700 to-slate-950/80 px-6 py-6 text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-purple-600/40"
            size="lg"
            >
            <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            </Button>

            <Button asChild
            variant="outline"
            className="rounded-full border-purple-500/30 bg-black/30 text-white hover:bg-purple-500/10 hover:text-white backdrop-blur-sm"
            size="lg"
            >
            <Link href="/login">
                Sign In
            </Link>
            </Button>
        </motion.div>
      </motion.main>
    </section>
  );
}
