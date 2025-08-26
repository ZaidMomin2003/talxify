
'use client';

import { useEffect, useState } from 'react';
import { easeInOut, motion, spring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart,
  BrainCircuit,
  Code,
  ArrowUpRight,
} from 'lucide-react';
import Image from 'next/image';

export default function AppHero() {
  const [stats, setStats] = useState({
    users: 0,
    interviews: 0,
    problems: 0,
  });
  
  const [sparkles, setSparkles] = useState<{ top: string; left: string; duration: number; delay: number; }[]>([]);

  useEffect(() => {
    // Generate sparkles only on the client
    setSparkles(
      Array.from({ length: 20 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    );

    const targets = { users: 500, interviews: 7800, problems: 17550 };
    const increments = { users: 10, interviews: 156, problems: 351 };
    
    const interval = setInterval(() => {
      setStats((prev) => {
        const newUsers = prev.users >= targets.users ? targets.users : prev.users + increments.users;
        const newInterviews = prev.interviews >= targets.interviews ? targets.interviews : prev.interviews + increments.interviews;
        const newProblems = prev.problems >= targets.problems ? targets.problems : prev.problems + increments.problems;

        if (newUsers === targets.users && newInterviews === targets.interviews && newProblems === targets.problems) {
          clearInterval(interval);
        }

        return {
          users: newUsers,
          interviews: newInterviews,
          problems: newProblems,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: spring, stiffness: 100 } },
  };

  const glowAnimation = {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: easeInOut },
  };

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: spring, stiffness: 100, delay: 1.2 } },
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-black py-16 text-white sm:px-6 lg:px-8 lg:py-2">
      <div className="absolute inset-0 z-0 h-full w-full rotate-180 items-center px-5 py-24 opacity-80 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#e63946_100%)]"></div>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-black/70 to-gray-950 blur-3xl"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>
        <div className="absolute top-20 -left-20 h-60 w-60 rounded-full bg-red-600/20 blur-[100px]"></div>
        <div className="absolute -right-20 bottom-20 h-60 w-60 rounded-full bg-blue-600/20 blur-[100px]"></div>
        <motion.div animate={glowAnimation} className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-indigo-500/10 blur-[80px]"></motion.div>
        <motion.div animate={glowAnimation} className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full bg-red-500/10 blur-[80px]"></motion.div>
        <div className="absolute inset-0 opacity-20">
          {sparkles.map((sparkle, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                top: sparkle.top,
                left: sparkle.left,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
              transition={{ duration: sparkle.duration, repeat: Infinity, ease: 'easeInOut', delay: sparkle.delay }}
            />
          ))}
        </div>
      </div>

      <div className="fadein-blur relative z-0 mx-auto mb-10 h-[300px] w-[300px] lg:absolute lg:top-1/2 lg:right-1/2 lg:mx-0 lg:mb-0 lg:h-[500px] lg:w-[500px] lg:translate-x-1/2 lg:-translate-y-2/3">
        <img
          src="/hero.webp"
          alt="Talxify platform visualization"
          className="h-full w-full object-contain drop-shadow-[0_0_35px_#3358ea85] transition-all duration-1000 hover:scale-110"
        />
        <motion.div variants={tooltipVariants} className="absolute top-4 -left-4 rounded-lg border border-red-500/30 bg-black/80 p-2 backdrop-blur-md lg:top-1/4 lg:-left-20">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-red-400" />
            <span className="text-xs font-medium text-red-200">AI Mock Interviews</span>
          </div>
        </motion.div>
        <motion.div variants={tooltipVariants} className="absolute top-1/2 -right-4 rounded-lg border border-blue-500/30 bg-black/80 p-2 backdrop-blur-md lg:-right-24">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-200">Coding Assistant</span>
          </div>
        </motion.div>
        <motion.div variants={tooltipVariants} className="absolute bottom-4 left-4 rounded-lg border border-indigo-500/30 bg-black/80 p-2 backdrop-blur-md lg:bottom-1/4 lg:left-8">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-200">Performance Analytics</span>
          </div>
        </motion.div>
      </div>

      <motion.main variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 mb-10 flex w-full max-w-[1450px] flex-grow flex-col items-center justify-center px-4 text-center sm:px-8 lg:mb-0 lg:items-start lg:justify-end lg:text-left">
        <motion.div className="flex w-full flex-col items-center justify-between lg:flex-row lg:items-start">
          <div className="w-full lg:w-auto">
            <motion.div variants={itemVariants} className="mb-4 inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-300">
              <span className="mr-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                New
              </span>
              Introducing Talxify Platform
            </motion.div>
            <motion.h1 variants={itemVariants} className="mb-6 bg-gradient-to-r from-white/70 via-white to-slate-500/80 bg-clip-text text-3xl leading-tight text-transparent sm:text-4xl md:text-5xl lg:text-6xl">
              Win your interviews<br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-red-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
                with AI Assistance
              </span>
            </motion.h1>
            <motion.div variants={itemVariants} className="mb-6 flex flex-wrap justify-center gap-4 md:gap-6 lg:justify-start">
              <div className="rounded-lg border border-red-500/20 bg-black/40 px-4 py-2 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stats.users.toLocaleString()}+</p>
                <p className="text-xs text-gray-400">Happy Users</p>
              </div>
              <div className="rounded-lg border border-blue-500/20 bg-black/40 px-4 py-2 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stats.interviews.toLocaleString()}+</p>
                <p className="text-xs text-gray-400">Interviews Taken</p>
              </div>
              <div className="rounded-lg border border-indigo-500/20 bg-black/40 px-4 py-2 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stats.problems.toLocaleString()}+</p>
                <p className="text-xs text-gray-400">Problems Solved</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="text-xs font-medium text-gray-400">Powered by:</span>
                <div className="flex items-center gap-1 text-sm"><div className="w-2 h-2 rounded-full bg-blue-400"/>Gemini</div>
                <div className="flex items-center gap-1 text-sm"><div className="w-2 h-2 rounded-full bg-red-400"/>Deepgram</div>
                <div className="flex items-center gap-1 text-sm"><div className="w-2 h-2 rounded-full bg-yellow-400"/>Genkit</div>
            </motion.div>
          </div>
          <div className="mt-6 flex flex-col items-center lg:mt-0 lg:items-end">
            <motion.p variants={itemVariants} className="mb-8 max-w-md px-6 text-center text-lg leading-relaxed text-slate-300/90 lg:text-end">
              Talxify connects you with AI-powered tools to practice mock interviews, sharpen your coding skills, and analyze your performance. Land your dream job, faster.
            </motion.p>
            <motion.div variants={itemVariants} className="mb-8 flex flex-col flex-wrap gap-4 sm:flex-row lg:justify-end">
              <Button asChild className="group rounded-full" size="lg">
                <Link href="/waitlist">
                  Join the waitlist
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-red-500/30 bg-transparent text-white hover:bg-red-500/10 hover:text-white" size="lg">
                 <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
            <motion.div variants={itemVariants} className="mx-auto flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 backdrop-blur-sm lg:mx-0 lg:ml-auto">
              <div className="flex -space-x-2">
                {[12, 32, 45, 11, 23].map((i) => (
                    <Image key={i}
                        src={`https://randomuser.me/api/portraits/thumb/men/${i}.jpg`}
                        alt={`user ${i}`}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full border-2 border-slate-900"
                    />
                ))}
              </div>
              <span className="text-xs text-slate-300">
                <span className="font-semibold text-white">500+</span> developers already preparing
              </span>
              <ArrowUpRight className="h-3 w-3 text-red-400" />
            </motion.div>
          </div>
        </motion.div>
      </motion.main>
      <div className="absolute right-auto -bottom-40 left-1/2 h-96 w-20 -translate-x-1/2 -rotate-45 rounded-full bg-gray-200/30 blur-[80px] lg:right-96 lg:left-auto lg:translate-x-0"></div>
      <div className="absolute right-auto -bottom-52 left-1/2 h-96 w-20 -translate-x-1/2 -rotate-45 rounded-full bg-gray-300/20 blur-[80px] lg:right-auto lg:left-auto lg:translate-x-0"></div>
      <div className="absolute right-auto -bottom-60 left-1/2 h-96 w-10 -translate-x-20 -rotate-45 rounded-full bg-gray-300/20 blur-[80px] lg:right-96 lg:left-auto lg:-translate-x-40"></div>
    </section>
  );
}
