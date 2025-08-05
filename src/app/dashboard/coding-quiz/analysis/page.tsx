
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import type { QuizState } from '../quiz/page';
import { analyzeCodingAnswers, AnalyzeCodingAnswersInput, AnswerAnalysis } from '@/ai/flows/analyze-coding-answers';

export type QuizResult = {
  id: string;
  timestamp: string;
  quizState: QuizState;
  analysis: AnswerAnalysis[];
  topics: string;
  difficulty: string;
}

export default function CodingQuizAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<AnswerAnalysis[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const quizId = searchParams.get('id');

    async function getAnalysis() {
      setIsLoading(true);
      if (quizId) {
        // Load from localStorage if an ID is provided
        const allResults: QuizResult[] = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
        const existingResult = allResults.find(r => r.id === quizId);
        if (existingResult) {
          setQuizResult(existingResult);
          setQuizState(existingResult.quizState);
          setAnalysis(existingResult.analysis);
          setIsLoading(false);
          return;
        } else {
          // If no result found with that ID, redirect
          router.replace('/dashboard');
          return;
        }
      }

      const results = sessionStorage.getItem('quizResults');
      if (!results) {
        // If no results, redirect back to the dashboard
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

        // Save the complete result to localStorage
        const newResult: QuizResult = {
          id: `quiz_${Date.now()}`,
          timestamp: new Date().toISOString(),
          quizState: parsedState,
          analysis: analysisResult.analysis,
          topics,
          difficulty,
        };

        const allResults: QuizResult[] = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
        allResults.unshift(newResult); // Add to the beginning
        localStorage.setItem('allQuizResults', JSON.stringify(allResults.slice(0, 10))); // Keep last 10

        // Clean up sessionStorage
        sessionStorage.removeItem('quizResults');
        sessionStorage.removeItem('quizTopics');
        sessionStorage.removeItem('quizDifficulty');

        // Update URL to reflect the new ID without reloading the page
        router.replace(`/dashboard/coding-quiz/analysis?id=${newResult.id}`, undefined);

      } catch (error) {
        console.error('Failed to analyze answers:', error);
        // Handle error state
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
              <AccordionContent className="text-base text-muted-foreground space-y-4">
                <div>
                    <h3 className="font-semibold text-foreground mb-2">Your Answer:</h3>
                    <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm"><code>{state.userAnswer || "// No answer provided"}</code></pre>
                </div>
                 <div>
                    <h3 className="font-semibold text-foreground mb-2">Correctness Score: {Math.round(analysis[index].score * 100)}%</h3>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-2">Feedback:</h3>
                    <p>{analysis[index].feedback}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-2">Correct Solution:</h3>
                     <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm"><code>{analysis[index].correctSolution}</code></pre>
                </div>
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
