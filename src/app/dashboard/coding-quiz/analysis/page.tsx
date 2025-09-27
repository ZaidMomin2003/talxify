
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, CheckCircle, XCircle, Sparkles, AlertTriangle } from 'lucide-react';
import type { QuizState } from '../quiz/page';
import { analyzeCodingAnswers, AnalyzeCodingAnswersInput, AnswerAnalysis } from '@/ai/flows/analyze-coding-answers';
import type { QuizResult, StoredActivity } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { getActivity, updateActivity } from '@/lib/firebase-service';


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
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold">Analyzing Your Quiz</h2>
            <p className="max-w-md text-muted-foreground">Our AI is reviewing your answers and generating detailed feedback. This might take a moment.</p>
        </div>
      </div>
    );
  }

  if (!analysis || !quizState) {
     return (
        <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Analysis Failed</CardTitle>
                    <CardDescription>
                        We couldn't retrieve or process the analysis for this quiz. Please try again later or return to your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg mb-8">
            <CardHeader className="text-center">
                <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="font-headline text-4xl font-bold">Quiz Analysis</h1>
                <CardDescription className="text-lg">
                    Here's the breakdown of your performance.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Overall Score</p>
                <p className="text-6xl font-bold text-primary">{overallScore}%</p>
            </CardContent>
        </Card>
        
        <h2 className="text-2xl font-bold mb-4">Detailed Feedback</h2>
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {quizState.map((state, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left hover:no-underline">
                <div className="flex justify-between items-center w-full pr-4">
                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: `Question ${index + 1}: ${state.question.questionText}` }} />
                    {analysis[index].isCorrect ? 
                        <CheckCircle className="h-6 w-6 text-green-500 shrink-0 ml-4" /> : 
                        <XCircle className="h-6 w-6 text-red-500 shrink-0 ml-4" />
                    }
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground space-y-4 p-4 bg-muted/50 rounded-b-lg">
                <div>
                    <h3 className="font-semibold text-foreground mb-2">Your Answer (Score: {Math.round(analysis[index].score * 100)}%)</h3>
                    <pre className="p-4 bg-background rounded-md overflow-x-auto text-sm font-mono"><code>{state.userAnswer || "// No answer provided"}</code></pre>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-2">AI Feedback:</h3>
                    <div className="p-4 bg-background rounded-md prose prose-sm dark:prose-invert max-w-none">
                       <p>{analysis[index].feedback}</p>
                    </div>
                </div>
                {!analysis[index].isCorrect && (
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">Correct Solution:</h3>
                        <pre className="p-4 bg-background rounded-md overflow-x-auto text-sm font-mono"><code>{analysis[index].correctSolution}</code></pre>
                    </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-8 text-center">
            <Button onClick={() => router.push(isIzanami ? '/dashboard/arena' : '/dashboard')}>Back to {isIzanami ? 'Arena' : 'Dashboard'}</Button>
        </div>
      </div>
    </main>
  );
}
