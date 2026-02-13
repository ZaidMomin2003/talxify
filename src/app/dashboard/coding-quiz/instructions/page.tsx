'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle, Code, Clock, BrainCircuit, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function CodingQuizInstructionsPage() {
  const searchParams = useSearchParams();
  const topics = searchParams.get('topics');
  const difficulty = searchParams.get('difficulty');
  const numQuestions = searchParams.get('numQuestions') || '3';

  const quizParams = new URLSearchParams({
    topics: topics || '',
    difficulty: difficulty || '',
    numQuestions: numQuestions,
  });

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-12 relative flex items-center justify-center min-h-[90vh]">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-dot-pattern opacity-[0.05]" />
      <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full"
      >
        <Card className="rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Code className="h-64 w-64" />
          </div>

          <CardHeader className="text-center pt-16 pb-12 relative z-10">
            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <div className="p-4 rounded-3xl bg-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] text-primary-foreground transform rotate-3">
                <Code className="h-10 w-10" />
              </div>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight italic text-white mb-4">
              Mission <span className="text-primary">Briefing</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground/80 font-medium max-w-2xl mx-auto italic">
              "Excellence is not an act, but a habit." Get ready to calibrate your technical proficiency.
            </motion.p>
          </CardHeader>

          <CardContent className="px-8 md:px-16 pb-16 space-y-12 relative z-10">
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Target Topic", value: topics, icon: <BrainCircuit className="h-4 w-4" /> },
                { label: "Complexity", value: difficulty, icon: <Sparkles className="h-4 w-4" />, isBadge: true },
                { label: "Objectives", value: `${numQuestions} Tasks`, icon: <CheckCircle className="h-4 w-4" /> }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                  <div className="text-primary mb-3 opacity-50 group-hover:opacity-100 transition-opacity">
                    {item.icon}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 italic">{item.label}</p>
                  {item.isBadge ? (
                    <Badge variant="outline" className="capitalize border-primary/20 bg-primary/10 text-primary font-black px-4 py-1 italic rounded-xl">
                      {item.value}
                    </Badge>
                  ) : (
                    <p className="text-xl font-black text-white italic truncate w-full">{item.value}</p>
                  )}
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary italic text-center opacity-60">Engagement Protocol</h2>
              <div className="grid gap-4 md:grid-cols-1">
                {[
                  {
                    title: "Advanced AI Calibration",
                    desc: "Challenges are dynamically generated and tailored to your specified domain and seniority level.",
                    icon: <BrainCircuit className="h-6 w-6" />
                  },
                  {
                    title: "Live Technical Execution",
                    desc: "Perform real-time coding within the sandbox. No artificial constraints, focus on quality and logic.",
                    icon: <Clock className="h-6 w-6" />
                  },
                  {
                    title: "Deep Neural Feedback",
                    desc: "Post-mission analysis providing holistic insights into syntax, efficiency, and architectural choices.",
                    icon: <CheckCircle className="h-6 w-6" />
                  }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                    <div className="bg-primary/10 text-primary rounded-2xl p-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-white uppercase italic tracking-tight mb-1">{step.title}</h3>
                      <p className="text-muted-foreground/70 text-sm italic font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center pt-8">
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest italic text-lg shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-105 transition-all">
                <Link href={`/dashboard/coding-quiz/quiz?${quizParams.toString()}`}>
                  Initialize Session
                </Link>
              </Button>
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                System check complete. Ready for deployment.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
