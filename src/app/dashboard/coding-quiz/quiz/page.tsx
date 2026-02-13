
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CodeEditor from '@/components/ui/code-editor';
import { generateCodingQuestions, GenerateCodingQuestionsInput, CodingQuestion } from '@/ai/flows/generate-coding-questions';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertTriangle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addActivity, checkAndIncrementUsage } from '@/lib/firebase-service';
import type { QuizResult } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


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
    if(!user) return;

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
       <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold">Generating Your Quiz</h2>
            <p className="max-w-md text-muted-foreground">Our AI is crafting challenging questions based on your selections. This may take a few seconds.</p>
        </div>
      </div>
    );
  }

  if (showResumeDialog) {
    return (
        <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Resume Quiz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        We found a saved quiz for these settings. Would you like to continue where you left off or start a new quiz?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={startNewQuiz}>Start New</AlertDialogCancel>
                    <AlertDialogAction onClick={resumeQuiz}>Resume Quiz</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-lg">
            <CardHeader>
                 <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                    <AlertTriangle className="h-8 w-8" />
                 </div>
                <CardTitle className="text-2xl font-bold">Failed to Generate Quiz</CardTitle>
                <CardDescription>
                    The AI couldn't create questions for the topic <span className="font-semibold text-foreground">{topics}</span>. Please try a different or broader topic.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.back()}>Go Back & Try Again</Button>
            </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                 <Button variant="outline" size="sm" onClick={saveAndExit}>
                    <Save className="mr-2 h-4 w-4"/>
                    Save & Exit
                </Button>
                 <p className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </p>
            </div>
            <Progress value={progress} className="w-full" />
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Question {currentQuestionIndex + 1}</CardTitle>
            <CardDescription className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />
          </CardHeader>
          <CardContent>
             <CodeEditor
                value={userAnswers[currentQuestionIndex]}
                onChange={handleAnswerChange}
                language={language}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={finishQuiz}>Finish Quiz</Button>
            ) : (
              <Button onClick={goToNextQuestion}>Next</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
