
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { getActivity, updateActivity } from '@/lib/firebase-service';
import type { InterviewActivity, GenerateInterviewFeedbackOutput } from '@/lib/types';
import { generateInterviewFeedback } from '@/ai/flows/generate-interview-feedback';
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

function ResultsError({ message }: { message: string }) {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Analysis Failed</CardTitle>
                    <CardDescription>
                        {message || "We couldn't find the interview or process the results. Please try again later or return to your dashboard."}
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
                feedback: feedbackResult.overall.feedback,
                details: {
                    ...activity.details,
                    score: feedbackResult.overall.score, // Score is 1-10, will be scaled in UI
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

    const scoreOutOf100 = useMemo(() => {
        if (!analysis?.overall?.score) return 0;
        return analysis.overall.score * 10;
    }, [analysis]);

    if (isLoading) return <ResultsLoader />;
    if (error || !analysis || !interview) return <ResultsError message={error || "Could not retrieve analysis."} />;
    
    const communicationScores = [
        { label: 'Fluency', score: analysis.fluency.score, feedback: analysis.fluency.feedback },
        { label: 'Clarity', score: analysis.clarity.score, feedback: analysis.clarity.feedback },
        { label: 'Vocabulary', score: analysis.vocabulary.score, feedback: analysis.vocabulary.feedback },
    ];

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
                                 <CardTitle className="text-3xl font-bold font-headline">Communication Report</CardTitle>
                                <CardDescription>A detailed breakdown of your English communication skills.</CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Overall Score</p>
                                <p className="text-5xl font-bold text-primary">{scoreOutOf100}<span className="text-2xl text-muted-foreground">/100</span></p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary"/> AI Summary</h3>
                            <p className="text-muted-foreground">{analysis.overall.feedback}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communicationScores.map(item => (
                        <Card key={item.label}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">{item.label}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold">{item.score}<span className="text-2xl text-muted-foreground">/10</span></p>
                                <p className="text-sm text-muted-foreground mt-2">{item.feedback}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>


                 {/* Transcript Analysis */}
                 {interview.transcript && interview.transcript.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold font-headline mb-4">Interview Transcript</h2>
                        <Card>
                           <CardContent className="p-6 max-h-96 overflow-y-auto">
                                <div className="space-y-4">
                                {interview.transcript.map((entry, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'user' ? 'justify-end' : ''}`}>
                                        {entry.speaker === 'ai' && (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <Bot className="w-5 h-5"/>
                                            </div>
                                        )}
                                        <div className={`rounded-lg p-3 max-w-lg ${entry.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            <p>{entry.text}</p>
                                        </div>
                                        {entry.speaker === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                <UserIcon className="w-5 h-5"/>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                </div>
                           </CardContent>
                        </Card>
                    </div>
                 )}

            </div>
        </main>
    );
}
