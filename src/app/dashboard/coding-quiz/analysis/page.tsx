

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Home, RefreshCw, Terminal, Cpu, Zap, Activity, CheckCircle, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/auth-context';
import type { QuizState } from '../quiz/page';
import { analyzeCodingAnswers, AnalyzeCodingAnswersInput, AnswerAnalysis } from '@/ai/flows/analyze-coding-answers';
import { getActivity, updateActivity } from '@/lib/firebase-service';
import type { QuizResult } from '@/lib/types';


export default function CodingQuizAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [analysis, setAnalysis] = useState<AnswerAnalysis[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isIzanami, setIsIzanami] = useState(false);

  const getAnalysis = useCallback(async () => {
    const quizId = searchParams.get('id');
    if (!user || !quizId) {
      setIsLoading(false);
      return;
    };

    setIsLoading(true);

    try {
      const allResults = await getActivity(user.uid);
      const currentQuizResult = allResults.find(r => r.id === quizId && r.type === 'quiz') as QuizResult | undefined;

      if (!currentQuizResult) {
        router.replace('/dashboard');
        return;
      }

      setIsIzanami(currentQuizResult.details.difficulty === 'Izanami Mode');

      // If analysis is already present, just display it
      if (currentQuizResult.analysis.length > 0) {
        setQuizState(currentQuizResult.quizState);
        setAnalysis(currentQuizResult.analysis);
        setIsLoading(false);
        return;
      }

      // Otherwise, run the analysis
      const parsedState: QuizState = currentQuizResult.quizState;
      setQuizState(parsedState);

      const input: AnalyzeCodingAnswersInput = { submissions: parsedState };
      const analysisResult = await analyzeCodingAnswers(input);
      setAnalysis(analysisResult.analysis);

      const score = Math.round(analysisResult.analysis.reduce((sum, item) => sum + item.score, 0) / analysisResult.analysis.length * 100);

      const updatedResult: QuizResult = {
        ...currentQuizResult,
        analysis: analysisResult.analysis,
        details: {
          ...currentQuizResult.details,
          score: `${score}%`
        }
      };

      await updateActivity(user.uid, updatedResult);
    } catch (error) {
      console.error('Failed to analyze answers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchParams, router]);

  useEffect(() => {
    getAnalysis();
  }, [getAnalysis]);

  const overallScore = useMemo(() => {
    if (!analysis) return 0;
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    return Math.round((totalScore / analysis.length) * 100);
  }, [analysis]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-32 -mr-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-12 text-center relative z-10"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-[2rem] border-4 border-primary/20 flex items-center justify-center"
            >
              <div className="w-24 h-24 rounded-2xl border-4 border-primary/40 flex items-center justify-center">
                <Activity className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary/20 blur-3xl -z-10"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              Processing <span className="text-primary italic">Results</span>
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] italic">Compiling Performance Metrics</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 bg-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!analysis || !quizState) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 bg-black">
        <Card className="max-w-md w-full text-center rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <XCircle className="h-32 w-32" />
          </div>
          <CardHeader className="space-y-6">
            <div className="mx-auto bg-destructive/10 text-destructive rounded-2xl p-4 w-fit border border-destructive/20 scale-125 mb-4">
              <XCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Analysis <span className="text-destructive">Terminated</span></CardTitle>
            <CardDescription className="text-muted-foreground italic font-medium">
              System was unable to retrieve performance data. The record may be corrupted or inaccessible.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-tight italic bg-white/10 text-white border border-white/10 hover:bg-white hover:text-black transition-all"
            >
              Return to Headquarters
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-12 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-dot-pattern opacity-[0.03]" />
      <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] italic">
              <Activity className="w-3 h-3" /> Post-Mission Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
              Performance <span className="text-primary opacity-50">Debrief</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/coding-quiz/instructions')}
              className="rounded-xl border-white/10 bg-white/5 font-black uppercase tracking-tighter italic h-12 px-6 hover:bg-white/10 transition-all text-muted-foreground hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-Initialize
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              className="rounded-xl font-black uppercase tracking-tighter italic h-12 px-8 bg-primary text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 rounded-[2rem] border-white/10 bg-black/40 backdrop-blur-xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 bg-primary/5 opacity-50" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-2">Overall Score</p>
              <div className="text-7xl font-black italic text-white tracking-tighter leading-none mb-2">
                {overallScore}<span className="text-2xl text-primary">%</span>
              </div>
              <Badge variant="outline" className={cn(
                "font-black uppercase tracking-widest italic border-white/10",
                overallScore >= 80 ? "bg-green-500/10 text-green-500" : overallScore >= 50 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
              )}>
                {overallScore >= 80 ? "Exceptional" : overallScore >= 50 ? "Acceptable" : "Critical Failure"}
              </Badge>
            </div>
          </Card>

          <div className="md:col-span-2 space-y-4">
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 h-full backdrop-blur-xl flex flex-col justify-center">
              <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-4">Mission Summary</h3>
              <p className="text-muted-foreground font-medium italic leading-relaxed">
                Evaluation complete. Below is a detailed breakdown of each objective.
                Review the neural feedback to identify architectural weaknesses and optimize your logic for future deployments.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white pl-2 border-l-4 border-primary">Detailed Logs</h2>

        <div className="space-y-4">
          {quizState.map((state, index) => {
            const result = analysis[index];
            const score = Math.round(result.score * 100);
            const isPassing = score >= 70;

            return (
              <Card key={index} className="rounded-[2rem] border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden group">
                <div className="p-1 h-1 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20" />

                <div className="p-6 md:p-8 space-y-6">
                  {/* Question Header */}
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-lg border-white/10 bg-white/5 text-muted-foreground font-black italic">
                          #{index + 1}
                        </Badge>
                        <h3 className="text-lg font-bold text-white italic">Execution Objective</h3>
                      </div>
                      <div
                        className="text-muted-foreground/90 text-sm font-medium italic leading-relaxed prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: state.question.questionText }}
                      />
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <div className={cn(
                        "text-3xl font-black italic tracking-tighter",
                        isPassing ? "text-green-500" : "text-red-500"
                      )}>
                        {score}%
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Efficiency Rating</p>
                    </div>
                  </div>

                  {/* Analysis Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                    {/* User Code */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 italic pl-1">Source Code</p>
                      <div className="rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
                        <pre>{state.userAnswer || "// No code submitted"}</pre>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 italic pl-1">Neural Analysis</p>
                      <div
                        className="rounded-xl border border-primary/10 bg-primary/5 p-4 text-sm text-foreground/90 italic leading-relaxed prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: result.feedback }}
                      />
                    </div>
                  </div>

                  {/* Solution (if failed) */}
                  {!isPassing && (
                    <div className="pt-6 border-t border-white/5 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-500/70 italic pl-1">Optimal Solution</p>
                      <div className="rounded-xl border border-green-500/10 bg-green-500/5 p-4 font-mono text-xs text-green-400/90 overflow-x-auto">
                        <pre>{result.correctSolution}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </main>
  );
}
