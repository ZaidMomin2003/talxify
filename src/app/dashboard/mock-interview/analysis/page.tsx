
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Sparkles, AlertTriangle, MessageSquare, Bot, User, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
import type { InterviewActivity, InterviewAnalysis } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { getActivity, updateActivity } from '@/lib/firebase-service';
import { analyzeInterviewTranscript } from '@/ai/flows/analyze-interview-transcript';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function InterviewAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [interview, setInterview] = useState<InterviewActivity | null>(null);

  const getAnalysis = useCallback(async () => {
    const interviewId = searchParams.get('id');
    if (!user || !interviewId) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    
    try {
        const allResults = await getActivity(user.uid);
        const currentInterview = allResults.find(r => r.id === interviewId && r.type === 'interview') as InterviewActivity | undefined;

        if (!currentInterview) {
            router.replace('/dashboard');
            return;
        }
        
        setInterview(currentInterview);

        // If analysis is already present, just display it
        if (currentInterview.analysis) {
            setAnalysis(currentInterview.analysis);
        } else {
            // Otherwise, run the analysis
            const analysisResult = await analyzeInterviewTranscript({
                history: currentInterview.transcript,
                interviewContext: currentInterview.interviewContext,
            });
            setAnalysis(analysisResult);

            // Save the analysis back to Firestore
            const updatedInterview: InterviewActivity = {
                ...currentInterview,
                analysis: analysisResult,
            };
            await updateActivity(user.uid, updatedInterview);
        }
    } catch (error) {
        console.error('Failed to analyze interview:', error);
    } finally {
        setIsLoading(false);
    }
  }, [user, searchParams, router]);

  useEffect(() => {
    getAnalysis();
  }, [getAnalysis]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold">Analyzing Your Interview</h2>
            <p className="max-w-md text-muted-foreground">Our AI is reviewing your transcript and generating detailed feedback. This could take a moment.</p>
        </div>
      </div>
    );
  }

  if (!analysis || !interview) {
     return (
        <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Analysis Failed</CardTitle>
                    <CardDescription>
                        We couldn't retrieve or process the analysis for this interview. Please try again later or return to your dashboard.
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
                <h1 className="font-headline text-4xl font-bold">Interview Analysis</h1>
                <CardDescription className="text-lg capitalize">
                    {interview.interviewContext.type} interview for {interview.interviewContext.role} at {interview.interviewContext.company}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Overall Score</p>
                <div className='flex items-center justify-center gap-4'>
                    <p className="text-6xl font-bold text-primary">{analysis.overallScore}/10</p>
                </div>
                <Progress value={analysis.overallScore * 10} className="w-1/2 mx-auto mt-2 h-2" />
                 {analysis.overallFeedback?.summary && (
                    <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">{analysis.overallFeedback.summary}</p>
                 )}
            </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {analysis.overallFeedback?.strengths && (
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><CheckCircle className="text-green-500"/> Strengths</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                            {analysis.overallFeedback.strengths.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                )}
                 {analysis.overallFeedback?.areasForImprovement && (
                     <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><XCircle className="text-red-500"/> Areas for Improvement</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                            {analysis.overallFeedback.areasForImprovement.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                 )}
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
              <CardTitle>Skills Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.skillsBreakdown?.map(skill => (
                <div key={skill.skill}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium capitalize">{skill.skill}</span>
                    <span className="text-sm font-semibold text-primary">{skill.score}/10</span>
                  </div>
                  <Progress value={skill.score * 10} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>


        <h2 className="text-2xl font-bold mb-4">Question-by-Question Breakdown</h2>
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {analysis.questionAnalysis?.map((qa, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left hover:no-underline">
                <span>Q{index + 1}: {qa.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground space-y-6 p-4 bg-muted/50 rounded-b-lg">
                 <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><User className='w-4 h-4' /> Your Answer:</h3>
                    <div className="p-4 bg-background rounded-md border">
                        <p>{qa.userAnswer}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className='w-4 h-4 text-primary' /> AI Feedback:</h3>
                    <div className="p-4 bg-background rounded-md border">
                        <p>{qa.feedback}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Bot className='w-4 h-4' /> Suggested Answer:</h3>
                    <div className="p-4 bg-background rounded-md border">
                        <p>{qa.suggestedAnswer}</p>
                    </div>
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
