
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CodeEditor from '@/components/ui/code-editor';
import { generateCodingQuestions, GenerateCodingQuestionsInput, CodingQuestion } from '@/ai/flows/generate-coding-questions';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Terminal, Cpu, Zap, Save, AlertTriangle, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addActivity, checkAndIncrementUsage } from '@/lib/firebase-service';
import type { QuizResult } from '@/lib/types';


export type QuizState = {
  question: CodingQuestion;
  userAnswer: string;
}[];

export default function CodingQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  const topics = useMemo(() => searchParams.get('topics') || '', [searchParams]);
  const difficulty = useMemo(() => searchParams.get('difficulty') || 'easy', [searchParams]);
  const numQuestions = useMemo(() => parseInt(searchParams.get('numQuestions') || '3', 10), [searchParams]);
  const language = useMemo(() => searchParams.get('language') || 'JavaScript', [searchParams]);

  const storageKey = `quiz_progress_${topics}_${difficulty}_${numQuestions}`;

  const fetchQuestions = useCallback(async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsLoading(true);

    const usageCheck = await checkAndIncrementUsage(user.uid, 'codingQuiz');
    if (!usageCheck.success) {
      toast({ title: "Usage Limit Reached", description: usageCheck.message, variant: "destructive" });
      router.push('/dashboard/pricing');
      return;
    }

    if (!topics) {
      toast({
        title: 'Error',
        description: 'No topics specified for the quiz.',
        variant: 'destructive',
      });
      router.back();
      return;
    }

    try {
      const input: GenerateCodingQuestionsInput = {
        topics: topics,
        language: language,
        difficulty: difficulty as any,
        count: numQuestions,
        example: 'Write a function to reverse a string.'
      };
      const result = await generateCodingQuestions(input);
      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setUserAnswers(new Array(result.questions.length).fill(''));
      } else {
        toast({
          title: 'No Questions',
          description: 'The AI could not generate questions for the selected topic. Please try another one.',
          variant: 'destructive',
        });
        router.back();
      }
    } catch (error) {
      console.error('Failed to generate coding questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate coding questions. Please try again.',
        variant: 'destructive',
      });
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [topics, difficulty, numQuestions, router, toast, user, language]);

  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      setShowResumeDialog(true);
    } else {
      fetchQuestions();
    }
  }, [storageKey, fetchQuestions]);

  const resumeQuiz = () => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      const { questions: savedQuestions, userAnswers: savedAnswers, currentQuestionIndex: savedIndex } = JSON.parse(savedProgress);
      setQuestions(savedQuestions);
      setUserAnswers(savedAnswers);
      setCurrentQuestionIndex(savedIndex);
    }
    setIsLoading(false);
    setShowResumeDialog(false);
  }

  const startNewQuiz = () => {
    localStorage.removeItem(storageKey);
    setShowResumeDialog(false);
    fetchQuestions();
  }

  const saveProgress = useCallback(() => {
    const progress = {
      questions,
      userAnswers,
      currentQuestionIndex,
    };
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [storageKey, questions, userAnswers, currentQuestionIndex]);

  useEffect(() => {
    if (questions.length > 0) {
      saveProgress();
    }
  }, [userAnswers, currentQuestionIndex, questions.length, saveProgress]);

  const handleAnswerChange = (value: string | undefined) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = value || '';
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    if (!user) return;

    const quizState: QuizState = questions.map((q, i) => ({
      question: q,
      userAnswer: userAnswers[i],
    }));

    const attemptId = `quiz_attempt_${Date.now()}`;

    const quizResult: QuizResult = {
      id: attemptId,
      type: 'quiz',
      timestamp: new Date().toISOString(),
      quizState: quizState,
      analysis: [],
      topics: topics,
      difficulty: difficulty,
      details: {
        topic: topics,
        difficulty: difficulty,
        score: 'Pending'
      }
    };

    try {
      await addActivity(user.uid, quizResult);
      localStorage.removeItem(storageKey); // Clear saved progress on successful finish
      router.push(`/dashboard/coding-quiz/analysis?id=${attemptId}`);
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      toast({
        title: "Save Error",
        description: "Could not save your quiz. Please try again.",
        variant: "destructive"
      })
    }
  };

  const saveAndExit = () => {
    saveProgress();
    toast({
      title: "Progress Saved",
      description: "Your quiz progress has been saved. You can resume it later.",
    });
    router.push('/dashboard');
  }

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
                <Cpu className="h-10 w-10 text-primary animate-pulse" />
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
              Initializing <span className="text-primary italic">Neural</span> Link
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] italic">Calibrating Domain: {topics}</p>
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

          <Card className="max-w-md bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl p-6">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              Our AI architect is synthesizing a tailored set of technical challenges.
              Expect rigorous validation of your architectural knowledge and syntax proficiency.
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (showResumeDialog) {
    return (
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent className="rounded-[2.5rem] border-white/10 bg-black/80 backdrop-blur-2xl p-10 max-w-lg">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4">
              <History className="h-8 w-8 text-primary" />
            </div>
            <AlertDialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
              Legacy Progress <span className="text-primary">Detected</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground italic font-medium text-base">
              An active session remains in the buffer. Would you like to restore the previous state or initialize a clean deployment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-10">
            <AlertDialogCancel
              onClick={startNewQuiz}
              className="rounded-2xl h-14 font-black uppercase tracking-tight italic border-white/10 bg-white/5 text-white hover:bg-destructive hover:text-white transition-all flex-1"
            >
              Discard & Reset
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={resumeQuiz}
              className="rounded-2xl h-14 font-black uppercase tracking-tight italic bg-primary text-black hover:scale-105 transition-all flex-1"
            >
              Restore Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 bg-black">
        <Card className="max-w-md w-full text-center rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <AlertTriangle className="h-32 w-32" />
          </div>
          <CardHeader className="space-y-6">
            <div className="mx-auto bg-destructive/10 text-destructive rounded-2xl p-4 w-fit border border-destructive/20 scale-125 mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Generation <span className="text-destructive">Failure</span></CardTitle>
            <CardDescription className="text-muted-foreground italic font-medium">
              The AI was unable to synthesize challenges for <span className="text-white font-bold">{topics}</span>.
              Target domain might be too restrictive or outside the current training set.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Button
              onClick={() => router.back()}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-tight italic bg-white/10 text-white border border-white/10 hover:bg-white hover:text-black transition-all"
            >
              Return to Navigation
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-12 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-dot-pattern opacity-[0.03]" />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Global Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] italic">
              <Zap className="w-3 h-3" /> Live Assessment Session
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {topics} <span className="text-primary opacity-50">Protocol</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={saveAndExit}
              className="rounded-xl border-white/10 bg-white/5 font-black uppercase tracking-tighter italic h-10 px-6 hover:bg-white/10 transition-all"
            >
              <Save className="mr-2 h-4 w-4 text-primary" />
              Save Progress
            </Button>
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center font-black italic shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              {currentQuestionIndex + 1}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-start">
          {/* Top Panel: Question Details */}
          <div className="w-full space-y-6">
            <Card className="rounded-[2rem] border-white/10 bg-black/40 backdrop-blur-xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Terminal className="w-32 h-32" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Badge variant="outline" className="border-none text-primary font-black italic">#{currentQuestionIndex + 1}</Badge>
                    </div>
                    <h2 className="text-xl font-black italic uppercase tracking-tight text-white">Objective</h2>
                  </div>
                  <div
                    className="text-muted-foreground/90 font-medium leading-relaxed italic text-lg prose dark:prose-invert prose-p:mb-4 pr-2 max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }}
                  />
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Overall Progress</p>
                    <p className="text-[10px] font-black italic text-primary">{Math.round(progress)}%</p>
                  </div>
                  <Progress value={progress} className="h-2 rounded-full bg-white/5" />
                </div>
              </div>
            </Card>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4 italic group">
              <AlertTriangle className="w-5 h-5 text-primary shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Ensure your implementation environment is strictly <span className="text-white font-bold">{language}</span>.
                Logic efficiency and readability will be graded.
              </p>
            </div>
          </div>

          {/* Bottom Panel: Code Editor */}
          <div className="w-full space-y-6">
            <Card className="rounded-[2.5rem] border-white/10 bg-black/60 shadow-2xl overflow-hidden border">
              <div className="bg-white/5 px-8 h-14 flex items-center justify-between border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                  {language} · Buffer active
                </div>
              </div>

              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="min-h-[500px]">
                      <CodeEditor
                        value={userAnswers[currentQuestionIndex]}
                        onChange={handleAnswerChange}
                        language={language}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>

              <CardFooter className="bg-white/5 p-6 md:p-8 flex justify-between border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="rounded-xl h-12 px-6 font-black uppercase tracking-tight italic text-muted-foreground hover:text-white transition-all disabled:opacity-20"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={finishQuiz}
                    className="rounded-xl h-12 px-10 font-black uppercase tracking-tight italic bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105 transition-all"
                  >
                    Execute & Terminate
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextQuestion}
                    className="rounded-xl h-12 px-10 font-black uppercase tracking-tight italic bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all"
                  >
                    Advance Profile
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
