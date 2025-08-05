
'use client';

import { useEffect, useState } from 'react';
import { easeInOut, motion, spring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Database,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Bot, BrainCircuit, Code, BarChart } from 'lucide-react';


export default function LandingHero() {
  const [stats, setStats] = useState({
    interviews: 0,
    questions: 0,
    users: 0,
  });

  useEffect(() => {
    const totalInterviews = 1000;
    const totalQuestions = 5000;
    const totalUsers = 500;
    
    const interval = setInterval(() => {
      setStats((prev) => {
        const newInterviews = prev.interviews >= totalInterviews ? totalInterviews : prev.interviews + 25;
        const newQuestions = prev.questions >= totalQuestions ? totalQuestions : prev.questions + 125;
        const newUsers = prev.users >= totalUsers ? totalUsers : prev.users + 10;

        if (
          newInterviews === totalInterviews &&
          newQuestions === totalQuestions &&
          newUsers === totalUsers
        ) {
          clearInterval(interval);
        }

        return {
          interviews: newInterviews,
          questions: newQuestions,
          users: newUsers,
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
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background py-16 text-foreground sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--background))_40%,hsl(var(--primary))_100%)] opacity-20"></div>
      
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 -left-20 h-60 w-60 rounded-full bg-primary/10 blur-[100px]"></div>
        <div className="absolute -right-20 bottom-20 h-60 w-60 rounded-full bg-accent/10 blur-[100px]"></div>
        <motion.div
          animate={glowAnimation}
          className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-primary/5 blur-[80px]"
        ></motion.div>
        <motion.div
          animate={glowAnimation}
          className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full bg-accent/5 blur-[80px]"
        ></motion.div>
      </div>

       <div className="fadein-blur relative z-20 mx-auto mb-10 h-[250px] w-[250px] lg:absolute lg:top-1/2 lg:right-1/4 lg:mx-0 lg:mb-0 lg:h-[400px] lg:w-[400px] lg:translate-x-1/2 lg:-translate-y-1/2">
        <div className="absolute inset-0 flex items-center justify-center">
             <img
              src="https://blocks.mvp-subha.me/Adobe%20Express%20-%20file(1).png"
              alt="Talxify 3D Visualization"
              className="h-full w-full object-contain drop-shadow-[0_0_35px_hsl(var(--primary)/0.5)] transition-all duration-1000 hover:scale-110"
            />
        </div>
        <motion.div
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          className="absolute top-4 -left-4 rounded-lg border border-border bg-background/80 p-2 backdrop-blur-md lg:top-1/4 lg:-left-20"
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary-foreground">
              AI Mock Interviews
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          className="absolute top-1/2 -right-4 rounded-lg border border-border bg-background/80 p-2 backdrop-blur-md lg:-right-24"
        >
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary-foreground">
              Coding Assistant
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          className="absolute bottom-4 left-4 rounded-lg border border-border bg-background/80 p-2 backdrop-blur-md lg:bottom-1/4 lg:left-8"
        >
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary-foreground">
              Performance Analytics
            </span>
          </div>
        </motion.div>
      </div>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-[1450px] flex-grow flex-col items-center justify-center px-4 text-center sm:px-8 lg:items-start lg:text-left"
      >
        <motion.div className="flex w-full flex-col items-center lg:items-start">
          <div className="w-full lg:w-3/5">
            <motion.div
              variants={itemVariants}
              className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Gemini
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 bg-gradient-to-r from-foreground/70 via-foreground to-muted-foreground/80 bg-clip-text text-4xl font-headline font-bold leading-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Ace Your Next <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Tech Interview
              </span>
            </motion.h1>

             <motion.p
              variants={itemVariants}
              className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Talxify provides AI-powered mock interviews and a coding assistant to help you land your dream job in tech. Practice, get feedback, and track your progress.
            </motion.p>


            <motion.div
              variants={itemVariants}
              className="mb-8 flex flex-wrap justify-center gap-4 md:gap-6 lg:justify-start"
            >
              <div className="rounded-lg border border-border bg-background/40 px-4 py-2 backdrop-blur-sm">
                <p className="text-2xl font-bold text-foreground">
                  {stats.interviews.toLocaleString()}+
                </p>
                <p className="text-xs text-muted-foreground">Interviews Taken</p>
              </div>
              <div className="rounded-lg border border-border bg-background/40 px-4 py-2 backdrop-blur-sm">
                <p className="text-2xl font-bold text-foreground">
                  {stats.questions.toLocaleString()}+
                </p>
                <p className="text-xs text-muted-foreground">Problems Solved</p>
              </div>
              <div className="rounded-lg border border-border bg-background/40 px-4 py-2 backdrop-blur-sm">
                <p className="text-2xl font-bold text-foreground">
                  {stats.users.toLocaleString()}+
                </p>
                <p className="text-xs text-muted-foreground">Happy Users</p>
              </div>
            </motion.div>

            
            <motion.div
              variants={itemVariants}
              className="flex flex-col flex-wrap gap-4 sm:flex-row"
            >
                <Button asChild size="lg" className="rounded-full px-8 py-6 text-base">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-6 text-base">
                    <Link href="/login">
                        Already have an account?
                    </Link>
                </Button>
            </motion.div>

          </div>
        </motion.div>
      </motion.main>
    </section>
  );
}
