
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { getActivity, updateActivity } from '@/lib/firebase-service';
import type { InterviewActivity, GenerateInterviewFeedbackOutput } from '@/lib/types';
import { AlertTriangle, BarChart3, Bot, BrainCircuit, Check, CheckCircle, ChevronLeft, Flag, Gauge, Info, Loader2, MessageSquare, Percent, Sparkles, Star, Target, TrendingUp, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

const ScoreGauge = ({ score, label }: { score: number, label: string }) => {
    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;

    return (
        <Card className="flex flex-col items-center justify-center text-center p-4">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                        className="text-muted/50"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    <circle
                        className="text-primary"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{score}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{label}</p>
        </Card>
    );
};


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
            const res = await fetch('/api/interview-feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transcript: activity.transcript,
                topic: activity.details.topic,
                role: activity.details.role || 'Software Engineer',
                company: activity.details.company || undefined,
              }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch feedback from API.');
            }

            const feedbackResult = await res.json();
            setAnalysis(feedbackResult);

            const updatedActivity: InterviewActivity = {
                ...activity,
                analysis: feedbackResult,
                feedback: feedbackResult.summary,
                details: {
                    ...activity.details,
                    score: feedbackResult.crackingChance,
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
    if (error || !analysis || !interview) return <ResultsError message={error || "Could not retrieve analysis."} />;
    
    return (
         <main className="p-4 sm:p-6 lg:p-8 overflow-auto bg-muted/30 min-h-screen">
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
                                 <CardTitle className="text-3xl font-bold font-headline">Performance Report</CardTitle>
                                <CardDescription>A detailed breakdown of your interview skills.</CardDescription>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm text-muted-foreground">Chance of Cracking</p>
                                <p className="text-5xl font-bold text-primary">{analysis.crackingChance}<span className="text-2xl text-muted-foreground">%</span></p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <ScoreGauge score={analysis.fluencyScore} label="Fluency" />
                    <ScoreGauge score={analysis.knowledgeScore} label="Technical Knowledge" />
                    <ScoreGauge score={analysis.confidenceScore} label="Confidence" />
                </div>

                {/* Summary */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary"/> AI Summary & Action Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{analysis.summary}</p>
                    </CardContent>
                </Card>

                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-500"/> Strong Concepts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {analysis.strongConcepts.map((concept, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500"/>
                                        <span className="text-muted-foreground">{concept}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><Target className="w-5 h-5 text-destructive"/> Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-2">
                                {analysis.weakConcepts.map((concept, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-destructive"/>
                                        <span className="text-muted-foreground">{concept}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
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
