
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import type { QuizState } from '../quiz/page';
import { analyzeCodingAnswers, AnalyzeCodingAnswersInput, AnswerAnalysis } from '@/ai/flows/analyze-coding-answers';
import type { QuizResult, StoredActivity } from '@/lib/types';


export default function CodingQuizAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<AnswerAnalysis[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const quizId = searchParams.get('id');
    const attemptId = sessionStorage.getItem('currentQuizAttemptId');

    async function getAnalysis() {
      setIsLoading(true);

      // This logic handles viewing a past, completed result
      if (quizId && !attemptId) {
        const allResults: StoredActivity[] = JSON.parse(localStorage.getItem('allUserActivity') || '[]');
        const existingResult = allResults.find(r => r.id === quizId && r.type === 'quiz') as QuizResult | undefined;
        if (existingResult && existingResult.analysis.length > 0) {
          setQuizResult(existingResult);
          setQuizState(existingResult.quizState);
          setAnalysis(existingResult.analysis);
          setIsLoading(false);
          return;
        } else {
          router.replace('/dashboard');
          return;
        }
      }

      // This logic handles a new quiz submission that needs analysis
      const results = sessionStorage.getItem('quizResults');
      if (!results) {
        router.replace('/dashboard');
        return;
      }
      
      const parsedState: QuizState = JSON.parse(results);
      setQuizState(parsedState);
      
      const topics = sessionStorage.getItem('quizTopics') || 'N/A';
      const difficulty = sessionStorage.getItem('quizDifficulty') || 'N/A';

      try {
        const input: AnalyzeCodingAnswersInput = { submissions: parsedState };
        const analysisResult = await analyzeCodingAnswers(input);
        setAnalysis(analysisResult.analysis);

        const allActivity: StoredActivity[] = JSON.parse(localStorage.getItem('allUserActivity') || '[]');
        
        let finalId = attemptId;

        // Find the placeholder attempt and update it, or create a new entry
        const attemptIndex = allActivity.findIndex(a => a.id === attemptId);

        if (attemptIndex !== -1) {
            const updatedResult: QuizResult = {
                ...(allActivity[attemptIndex] as QuizResult),
                quizState: parsedState,
                analysis: analysisResult.analysis,
                details: {
                    ...allActivity[attemptIndex].details,
                    score: `${Math.round(analysisResult.analysis.reduce((sum, item) => sum + item.score, 0) / analysisResult.analysis.length * 100)}%`
                }
            };
            allActivity[attemptIndex] = updatedResult;
        } else {
            const newResult: QuizResult = {
                id: `quiz_${Date.now()}`,
                type: 'quiz',
                timestamp: new Date().toISOString(),
                quizState: parsedState,
                analysis: analysisResult.analysis,
                topics: topics,
                difficulty: difficulty,
                details: {
                    topic: topics,
                    difficulty: difficulty,
                    score: `${Math.round(analysisResult.analysis.reduce((sum, item) => sum + item.score, 0) / analysisResult.analysis.length * 100)}%`
                }
            };
            allActivity.unshift(newResult);
            finalId = newResult.id;
        }
        
        localStorage.setItem('allUserActivity', JSON.stringify(allActivity.slice(0, 20)));

        sessionStorage.removeItem('quizResults');
        sessionStorage.removeItem('quizTopics');
        sessionStorage.removeItem('quizDifficulty');
        sessionStorage.removeItem('currentQuizAttemptId');

        router.replace(`/dashboard/coding-quiz/analysis?id=${finalId}`, undefined);

      } catch (error) {
        console.error('Failed to analyze answers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    getAnalysis();
  }, [router, searchParams]);

  const overallScore = useMemo(() => {
    if (!analysis) return 0;
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    return Math.round((totalScore / analysis.length) * 100);
  }, [analysis]);


  if (isLoading || !quizState) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Our AI is analyzing your answers...</p>
      </div>
    );
  }

  if (!analysis) {
     return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p className="text-muted-foreground">Could not load analysis. Please try again later.</p>
         <Button onClick={() => router.push('/dashboard')} className="mt-4">Back to Dashboard</Button>
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
                    <span className="truncate">Question {index + 1}: {state.question.questionText}</span>
                    {analysis[index].isCorrect ? 
                        <CheckCircle className="h-6 w-6 text-green-500 shrink-0" /> : 
                        <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                    }
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground space-y-4 p-4 bg-muted/50 rounded-b-lg">
                <div>
                    <h3 className="font-semibold text-foreground mb-2">Your Answer (Score: {Math.round(analysis[index].score * 100)}%)</h3>
                    <pre className="p-4 bg-background rounded-md overflow-x-auto text-sm"><code>{state.userAnswer || "// No answer provided"}</code></pre>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-2">AI Feedback:</h3>
                    <div className="p-4 bg-background rounded-md">
                        <p>{analysis[index].feedback}</p>
                    </div>
                </div>
                {!analysis[index].isCorrect && (
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">Correct Solution:</h3>
                        <pre className="p-4 bg-background rounded-md overflow-x-auto text-sm"><code>{analysis[index].correctSolution}</code></pre>
                    </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-8 text-center">
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    </main>
  );
}
