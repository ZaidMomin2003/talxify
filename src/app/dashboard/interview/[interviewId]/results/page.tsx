
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, Bot, CheckCircle, ChevronLeft, MessageSquare, Mic, Sparkles, User, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, StoredActivity } from '@/lib/types';
import { getActivity, updateActivity } from '@/lib/firebase-service';
import { generateInterviewFeedback, GenerateInterviewFeedbackOutput } from '@/ai/flows/generate-interview-feedback';


export default function InterviewResultsPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [interviewData, setInterviewData] = useState<InterviewActivity | null>(null);
    const [analysis, setAnalysis] = useState<GenerateInterviewFeedbackOutput | null>(null);

    useEffect(() => {
        const fetchAndAnalyze = async () => {
            if (!user || !params.interviewId) return;

            setIsLoading(true);
            const allActivity = await getActivity(user.uid);
            const currentInterview = allActivity.find(a => a.id === params.interviewId && a.type === 'interview') as InterviewActivity | undefined;
            
            if (!currentInterview) {
                 setIsLoading(false);
                 return;
            }
            
            setInterviewData(currentInterview);
            
            // Check if analysis is already stored
            const storedAnalysis = (currentInterview as any).analysis;
            if (storedAnalysis && Object.keys(storedAnalysis).length > 0) {
                setAnalysis(storedAnalysis);
            } else {
                 setIsAnalyzing(true);
                 try {
                    const feedback = await generateInterviewFeedback({
                        transcript: currentInterview.transcript,
                        topic: currentInterview.details.topic,
                        role: currentInterview.details.role || 'Software Engineer',
                    });
                    setAnalysis(feedback);
                    
                    // Store the analysis back to Firebase
                    const updatedInterview: StoredActivity = { ...currentInterview, analysis: feedback };
                    await updateActivity(user.uid, updatedInterview);

                 } catch(error) {
                    console.error("Failed to generate interview feedback:", error);
                 } finally {
                    setIsAnalyzing(false);
                 }
            }
            setIsLoading(false);
        };
        fetchAndAnalyze();
    }, [user, params.interviewId]);


    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
    }

    if (!interviewData) {
         return (
            <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-8 text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Not Found</CardTitle>
                            <CardDescription>We could not find the results for this interview session.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button asChild>
                                <Link href="/dashboard">Back to Dashboard</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
         )
    }

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                     <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <Card className="shadow-lg">
                        <CardHeader className="text-center">
                            <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
                            <CardTitle className="font-headline text-4xl font-bold">Interview Analysis</CardTitle>
                            <CardDescription className="text-lg">
                                Here's a detailed breakdown of your mock interview for the <span className="font-semibold text-foreground">{interviewData.details.role}</span> role on the topic of <span className="font-semibold text-foreground">{interviewData.details.topic}</span>.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {isAnalyzing ? (
                    <Card className="text-center p-8">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <CardTitle className="text-2xl font-bold">Analyzing Your Interview...</CardTitle>
                        <CardDescription>Our AI coach is reviewing your transcript to provide feedback. This may take a moment.</CardDescription>
                    </Card>
                ) : !analysis ? (
                     <Card className="text-center p-8">
                        <CardTitle className="text-2xl font-bold">Analysis Not Available</CardTitle>
                        <CardDescription>We were unable to generate feedback for this interview.</CardDescription>
                    </Card>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>Overall Score</CardTitle>
                             </CardHeader>
                             <CardContent className="text-center">
                                 <span className="text-7xl font-bold text-primary">{analysis.overallScore}</span>
                                 <span className="text-3xl text-muted-foreground">%</span>
                             </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><Bot className="h-6 w-6"/> AI Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground text-base">{analysis.summary}</p>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Strengths:</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Areas for Improvement:</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {analysis.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Detailed Analysis */}
                    <div className="lg:col-span-2">
                         <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                            <BarChart className="h-8 w-8" /> Detailed Question Analysis
                        </h2>
                        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-0">
                            {analysis.questionFeedback.map((q, index) => (
                                <AccordionItem value={`item-${index}`} key={index} asChild>
                                    <Card className="overflow-hidden">
                                        <AccordionTrigger className="flex justify-between items-center w-full p-6 text-lg text-left hover:no-underline data-[state=open]:border-b">
                                            <span className="truncate flex-1 pr-4">Question {index + 1}</span>
                                            <div className="ml-4 flex items-center gap-2 shrink-0">
                                                <Badge variant={q.score > 80 ? 'default' : q.score > 60 ? 'secondary' : 'destructive'}>{q.score}%</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-6 pt-4 space-y-6 bg-muted/30">
                                                 <div>
                                                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Bot className="h-5 w-5 text-primary"/> Question</h3>
                                                    <blockquote className="p-4 bg-background rounded-md text-muted-foreground border-l-4 border-primary">{q.question}</blockquote>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><User className="h-5 w-5 text-blue-500"/> Your Answer</h3>
                                                    <blockquote className="p-4 bg-background rounded-md italic text-muted-foreground border-l-4 border-blue-500">{q.userAnswer}</blockquote>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-500"/> AI Feedback</h3>
                                                    <div className="p-4 bg-background rounded-md text-muted-foreground">{q.feedback}</div>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/> Ideal Answer</h3>
                                                    <div className="p-4 bg-background rounded-md text-muted-foreground">{q.idealAnswer}</div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </Card>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
                )}

                <div className="text-center pt-8">
                    <Button onClick={() => router.push('/dashboard/interview/setup')} size="lg">
                       <Mic className="mr-2 h-4 w-4"/> Try Another Interview
                    </Button>
                </div>
            </div>
        </main>
    )
}
