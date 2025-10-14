'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { getActivity, getUserData, updateActivity } from '@/lib/firebase-service';
import type { InterviewActivity, StoredActivity } from '@/lib/types';
import { generateInterviewFeedback, GenerateInterviewFeedbackOutput } from '@/ai/flows/generate-interview-feedback';
import { AlertTriangle, BarChart3, Bot, BrainCircuit, CheckCircle, ChevronLeft, Flag, Gauge, Info, Loader2, MessageSquare, Percent, Sparkles, Star, TrendingUp, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function ResultsLoader() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold">Analyzing Your Interview...</h2>
                <p className="max-w-md text-muted-foreground">Our AI Coach is reviewing your transcript to provide detailed feedback. This might take a moment.</p>
            </div>
        </div>
    )
}

function ResultsError() {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Analysis Failed</CardTitle>
                    <CardDescription>
                        We couldn't find the interview or process the results. Please try again later or return to your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <a href="/dashboard">Back to Dashboard</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function InterviewResultsPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    
    const interviewId = params.interviewId as string;
    const [interview, setInterview] = useState<InterviewActivity | null>(null);
    const [analysis, setAnalysis] = useState<GenerateInterviewFeedbackOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const generateFeedback = useCallback(async (activity: InterviewActivity) => {
        if (!activity || !activity.transcript || activity.transcript.length < 2) {
             setError("Not enough conversation to analyze.");
             return;
        }

        try {
            const feedbackResult = await generateInterviewFeedback({
                transcript: activity.transcript,
                topic: activity.details.topic,
                role: activity.details.role || 'Software Engineer',
                company: activity.details.company || undefined,
            });

            setAnalysis(feedbackResult);

            const updatedActivity: InterviewActivity = {
                ...activity,
                analysis: feedbackResult,
                feedback: feedbackResult.summary,
                details: {
                    ...activity.details,
                    score: feedbackResult.overallScore,
                }
            };
            if(user) {
                await updateActivity(user.uid, updatedActivity);
            }
        } catch (e: any) {
            console.error("Feedback generation failed:", e);
            setError(`AI feedback generation failed: ${e.message}`);
        }
    }, [user]);
    
    const fetchInterviewData = useCallback(async () => {
        if (!user || !interviewId) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const userActivity = await getActivity(user.uid);
            const currentInterview = userActivity.find(a => a.id === interviewId && a.type === 'interview') as InterviewActivity | undefined;

            if (!currentInterview) {
                setError("Interview not found.");
                setIsLoading(false);
                return;
            }
            
            setInterview(currentInterview);
            
            if (currentInterview.analysis) {
                setAnalysis(currentInterview.analysis);
            } else {
                await generateFeedback(currentInterview);
            }

        } catch (e: any) {
            console.error("Error fetching interview data:", e);
            setError(`Failed to load interview data: ${e.message}`);
        } finally {
            setIsLoading(false);
        }

    }, [user, interviewId, generateFeedback]);

    useEffect(() => {
        fetchInterviewData();
    }, [fetchInterviewData]);

    if (isLoading) return <ResultsLoader />;
    if (error || !analysis || !interview) return <ResultsError />;

    return (
         <main className="p-4 sm:p-6 lg:p-8 overflow-auto bg-muted/30">
            <div className="max-w-6xl mx-auto space-y-8">
                 <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/arena')} className="mb-4">
                    <ChevronLeft className="mr-2 h-4 w-4"/> Back to Arena
                </Button>

                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                 <Badge variant="secondary" className="mb-2">{interview.details.topic}</Badge>
                                 <CardTitle className="text-3xl font-bold font-headline">Interview Performance Report</CardTitle>
                                <CardDescription>A detailed breakdown of your mock interview performance.</CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Overall Score</p>
                                <p className="text-5xl font-bold text-primary">{analysis.overallScore}<span className="text-2xl text-muted-foreground">/100</span></p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary"/> AI Summary</h3>
                            <p className="text-muted-foreground">{analysis.summary}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="w-5 h-5"/> Likelihood to Crack</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analysis.likelihoodToCrack}%</p>
                            <p className="text-sm text-muted-foreground">Based on overall performance</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><UserIcon className="w-5 h-5"/> Confidence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analysis.confidenceScore}<span className="text-2xl text-muted-foreground">/100</span></p>
                            <Progress value={analysis.confidenceScore} className="mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="w-5 h-5"/> English Proficiency</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analysis.englishProficiency}<span className="text-2xl text-muted-foreground">/100</span></p>
                            <Progress value={analysis.englishProficiency} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-green-500/5 border-green-500/20">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400"><Star className="w-5 h-5"/> Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card className="bg-red-500/5 border-red-500/20">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-500"><Flag className="w-5 h-5"/> Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                {analysis.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                 {/* Question by Question Analysis */}
                 <div>
                    <h2 className="text-2xl font-bold font-headline mb-4">Question Analysis</h2>
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {analysis.questionFeedback.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg text-left hover:no-underline">
                                    <div className="flex justify-between items-center w-full pr-4">
                                        <span className="flex-1">Question {index + 1}: {item.question}</span>
                                        <div className="flex items-center gap-2 shrink-0 ml-4">
                                            <Badge variant={item.score > 75 ? 'default' : 'destructive'}>{item.score}%</Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-background/50 rounded-b-md">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-muted-foreground mb-2">Your Answer:</h4>
                                            <blockquote className="border-l-4 pl-4 italic text-foreground">"{item.userAnswer}"</blockquote>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold text-muted-foreground mb-2">Feedback:</h4>
                                            <div className="p-4 bg-muted/50 rounded-md prose prose-sm dark:prose-invert max-w-none text-foreground">
                                                <p>{item.feedback}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-muted-foreground mb-2">Ideal Answer Example:</h4>
                                            <div className="p-4 bg-green-500/10 rounded-md prose prose-sm dark:prose-invert max-w-none text-foreground">
                                                <p>{item.idealAnswer}</p>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

            </div>
        </main>
    );
}
