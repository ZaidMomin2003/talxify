
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Rocket, BrainCircuit, MessageSquare, FileText, Bot, ShieldQuestion, User, Video, Phone, Mic, BarChart, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const featurePrototypes = [
  // Step 1: Generate Practice Material
  (
    <Card className="w-full h-full max-w-lg mx-auto bg-card/60 dark:bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 shadow-2xl border-border dark:border-white/10 rounded-[2rem] flex flex-col justify-center overflow-hidden relative">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      <CardHeader className="p-0 mb-6 flex flex-row items-center gap-4 relative z-10">
        <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
          <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div>
          <CardTitle className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter m-0 text-foreground">Practice <span className="text-primary">Material</span></CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Smart Interview Prep</p>
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-4 relative z-10">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-[1.2rem] bg-muted/50 border border-border/50 shadow-sm"
        >
          <Badge className="mb-2 text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary border-none">Coding Objective</Badge>
          <p className="font-bold text-sm sm:text-base text-foreground/90 italic">Implement Kadane's Algorithm for maximum subarray sum.</p>
        </motion.div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-[1.2rem] bg-muted/30 border border-border/30 opacity-60"
        >
          <Badge variant="secondary" className="mb-2 text-[9px] font-black uppercase tracking-widest border-none">Behavioral Analysis</Badge>
          <p className="font-bold text-sm sm:text-base text-muted-foreground italic">Describe a scenario where you took ownership of a critical failure.</p>
        </motion.div>
      </CardContent>
    </Card>
  ),
  // Step 2: Practice with AI
  (
    <div className="w-full max-w-lg mx-auto aspect-video rounded-[2rem] sm:rounded-[2.5rem] p-3 shadow-2xl border-border dark:border-white/10 bg-card/40 dark:bg-black/40 backdrop-blur-2xl relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5 z-0" />

      {/* Central Interviewer */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-32 lg:w-36 rounded-full">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse duration-[2000ms]" />
          <Avatar className="w-20 h-20 sm:w-28 lg:w-30 border-4 border-background shadow-2xl relative z-20">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 text-primary">
              <Bot className="w-10 h-10 sm:w-14" />
            </div>
          </Avatar>
        </div>
        <div className="mt-3 text-center">
          <h4 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none">Mark <span className="text-primary">AI</span></h4>
          <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Technical Lead</p>
        </div>
      </div>

      {/* Mini Video Feed - Hidden on very small screens to save space */}
      <div className="hidden sm:flex absolute bottom-4 right-4 w-24 h-16 lg:w-32 lg:h-20 rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl items-center justify-center backdrop-blur-md">
        <Video className="w-6 h-6 text-white/20" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase text-white/50">User</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 sm:px-4 sm:py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>Analyzing...</span>
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-4 rounded-xl bg-background/50 dark:bg-black/40 border border-border p-1.5 sm:p-2 backdrop-blur-xl shadow-xl">
        <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted/50 hover:bg-muted text-foreground" variant="ghost">
          <Mic className="w-4 h-4" />
        </Button>
        <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20" variant="ghost">
          <Phone className="w-4 h-4 translate-y-px" />
        </Button>
      </div>
    </div>
  ),
  // Step 3: Build Your Profile
  (
    <Card className="w-full h-full max-w-lg mx-auto bg-card/60 dark:bg-zinc-900/40 backdrop-blur-xl p-4 sm:p-8 shadow-2xl border-border dark:border-white/10 rounded-[2rem] flex flex-col justify-center overflow-hidden relative">
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      <CardHeader className="p-0 mb-4 sm:mb-6 flex-row items-center gap-3 sm:gap-4 relative z-10">
        <div className="p-2 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary border border-primary/20 shadow-lg shadow-primary/5">
          <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div>
          <CardTitle className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter m-0 text-foreground">Pro <span className="text-primary">Portfolio</span></CardTitle>
          <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Career Profile Ready</p>
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-3 sm:space-y-4 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-[1rem] bg-muted/40 border border-border/40 shadow-sm">
          <Avatar className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-primary ring-4 ring-primary/5">
            <AvatarFallback className="font-black text-primary text-xs sm:text-base">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-black italic uppercase tracking-tighter text-base sm:text-lg text-foreground leading-none">Jane Doe</p>
            <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 italic">Architect</p>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>

        <div className="p-3 rounded-[1rem] bg-muted/20 border border-border/10 space-y-2">
          <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Core Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {['React', 'Next.js', 'TS'].map(skill => (
              <Badge key={skill} className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">{skill}</Badge>
            ))}
          </div>
        </div>

        <div className="hidden sm:block p-3 rounded-[1rem] bg-muted/20 border border-border/10">
          <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-1.5">Featured Work</p>
          <div className="p-2 rounded-lg bg-background/50 border border-border/30">
            <div className="flex justify-between items-center mb-0.5">
              <p className="font-black italic uppercase tracking-tighter text-[10px] text-foreground">Talxify AI</p>
              <Rocket size={10} className="text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  // Step 4: Land Your Job
  (
    <Card className="w-full h-full max-w-lg mx-auto bg-card/60 dark:bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl border-border dark:border-white/10 rounded-[2.5rem] flex flex-col justify-center text-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-primary/10 z-0" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="mx-auto w-fit p-5 sm:p-6 rounded-3xl bg-green-500/20 text-green-500 mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)] relative z-10"
      >
        <Rocket className="w-10 h-10 sm:w-14 sm:h-14" />
      </motion.div>
      <div className="relative z-10">
        <h3 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-foreground mb-4 leading-none">Get <span className="text-green-500">Hired</span></h3>
        <p className="text-sm sm:text-lg font-medium text-muted-foreground italic max-w-xs mx-auto">Your preparation met opportunity. Congratulations on the new role at your dream company.</p>
        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={16} className="text-amber-400 fill-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </Card>
  )
];


const features = [
  {
    step: 'Step 01',
    title: 'Smart Study Prep',
    content:
      "Get custom study notes and coding challenges tailored for your dream job and target company.",
    icon: <BrainCircuit className="h-6 w-6" />,
    prototype: featurePrototypes[0],
  },
  {
    step: 'Step 02',
    title: 'AI Mock Interview',
    content:
      'Practice with realistic AI interviews and coding challenges that feel like the real thing.',
    icon: <Bot className="h-6 w-6" />,
    prototype: featurePrototypes[1],
  },
  {
    step: 'Step 03',
    title: 'Professional Profile',
    content:
      'Build a standout resume and professional portfolio with our AI-powered career tools.',
    icon: <FileText className="h-6 w-6" />,
    prototype: featurePrototypes[2],
  },
  {
    step: 'Step 04',
    title: 'Job Offer Victory',
    content:
      'Build confidence for your interviews and land top-tier job offers with ease.',
    icon: <Rocket className="h-6 w-6" />,
    prototype: featurePrototypes[3],
  },
];

export default function LandingFeatureSteps() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setProgress(0);
    const progressTimer = setInterval(() => {
      setProgress(p => {
        const newProgress = p + (100 / (6000 / 50));
        if (newProgress >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return newProgress;
      })
    }, 50);

    return () => clearInterval(progressTimer);
  }, [currentFeature])

  return (
    <div className={'p-6 sm:p-12 md:p-24 bg-background relative overflow-hidden'} id="how-it-works">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto w-full max-w-7xl relative z-10">
        <div className="relative mx-auto mb-20 max-w-3xl sm:text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
          >
            <Zap size={14} className="fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">How it Works</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight italic uppercase md:text-5xl lg:text-6xl text-foreground leading-[0.9]"
          >
            Get Hired in <span className="text-primary">4 Simple Steps.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base sm:text-lg font-medium max-w-2xl mx-auto italic"
          >
            Talxify helps you prepare for interviews from start to finish with powerful AI tools.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 lg:items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-4">
            {features.map((feature, index) => {
              const isActive = index === currentFeature;
              return (
                <motion.div
                  key={index}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-500 cursor-pointer border",
                    isActive
                      ? "bg-card/40 dark:bg-primary/5 border-primary/30 shadow-2xl shadow-primary/10 scale-[1.01]"
                      : "bg-transparent border-transparent hover:bg-muted/30 opacity-40 hover:opacity-100"
                  )}
                  onTap={() => {
                    setCurrentFeature(index);
                    setProgress(0);
                  }}
                >
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 border-2",
                    isActive
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 rotate-3"
                      : "bg-muted border-border text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
                  )}>
                    <div className={cn("transition-transform duration-500", isActive && "scale-110")}>
                      {feature.icon}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] italic transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {feature.step}
                    </span>
                    <h3 className={cn(
                      "text-xl font-black italic uppercase tracking-tight transition-colors leading-none",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {feature.title}
                    </h3>
                    <p className={cn(
                      "text-sm font-medium italic transition-colors leading-relaxed",
                      isActive ? "text-muted-foreground/90" : "text-muted-foreground/50 group-hover:text-muted-foreground/80"
                    )}>
                      {feature.content}
                    </p>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full hidden md:block"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="lg:col-span-7 hidden lg:block">
            <div className="relative h-full min-h-[500px] rounded-[3rem] border border-border dark:border-white/10 bg-muted/20 dark:bg-black/20 backdrop-blur-3xl overflow-hidden shadow-2xl group shadow-primary/5">
              <div className="absolute inset-x-0 h-40 top-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  className="absolute inset-0 p-3 sm:p-8 lg:p-12 flex items-center justify-center"
                  initial={{ y: 60, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -60, opacity: 0, scale: 1.05 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.19, 1, 0.22, 1]
                  }}
                >
                  <div className="w-full relative group-hover:scale-[1.02] transition-transform duration-700">
                    {features[currentFeature].prototype}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress HUD */}
              <div className="absolute bottom-8 left-8 right-8 z-30 flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-background/80 dark:bg-black/60 backdrop-blur-md border border-border flex items-center justify-center text-primary font-black italic tracking-tighter">
                      0{currentFeature + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none mb-1">Status</span>
                      <span className="text-xs font-black uppercase text-foreground leading-none">Simulation Active</span>
                    </div>
                  </div>
                  <div className="text-right">

                    <span className="text-xs font-black italic tracking-tighter text-foreground tabular-nums">{Math.round(progress)}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-muted/30 dark:bg-white/5 rounded-full overflow-hidden border border-border/10">
                  <motion.div
                    className="h-full bg-primary relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute top-0 right-0 h-full w-4 bg-white/40 blur-sm" />
                  </motion.div>
                </div>
              </div>

              {/* Grid Decoration */}
              <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
