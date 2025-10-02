
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, Bot, CheckCircle, ChevronLeft, MessageSquare, Mic, Sparkles, User, XCircle, Loader2, Building, RefreshCw, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity } from '@/lib/types';
import { getActivity, updateActivity } from '@/lib/firebase-service';
import { generateInterviewFeedback, GenerateInterviewFeedbackOutput } from '@/ai/flows/generate-interview-feedback';

const demoInterviewData: InterviewActivity = {
    id: 'demo',
    type: 'interview',
    timestamp: new Date().toISOString(),
    transcript: [
        { speaker: 'ai', text: 'Welcome! Let\'s talk about React Hooks. Can you explain what the `useEffect` hook is and its primary purpose?' },
        { speaker: 'user', text: 'Sure, useEffect is a hook that lets you perform side effects in function components. It runs after every render by default.' },
        { speaker: 'ai', text: 'Good start. What are some common examples of side effects you would manage with `useEffect`?' },
        { speaker: 'user', text: 'Things like fetching data from an API, setting up subscriptions, or manually changing the DOM.' },
    ],
    feedback: "Feedback generated.",
    details: {
        topic: 'React Hooks',
        role: 'Frontend Developer',
        level: 'Mid-level',
        company: 'Innovate Inc.',
    }
};

const demoAnalysisData: GenerateInterviewFeedbackOutput = {
    overallScore: 82,
    likelihoodToCrack: 75,
    englishProficiency: 90,
    confidenceScore: 85,
    summary: 'A strong performance overall. You have a solid grasp of React Hooks but could improve the depth of your explanations on dependency arrays and cleanup functions.',
    strengths: [
        'Clear and concise initial explanations.',
        'Good understanding of common use cases for `useEffect`.',
        'Demonstrated knowledge of the component lifecycle.'
    ],
    areasForImprovement: [
        'Provide more detail on how the dependency array optimizes performance.',
        'Explain the importance of the cleanup function in `useEffect` to prevent memory leaks.',
        'Structure answers more completely, especially for behavioral questions.'
    ],
    questionFeedback: [
        {
            question: 'Can you explain what the `useEffect` hook is and its primary purpose?',
            userAnswer: 'Sure, useEffect is a hook that lets you perform side effects in function components. It runs after every render by default.',
            feedback: 'Your answer is correct and concise. To make it even better, you could have mentioned the dependency array and how it controls when the effect runs.',
            idealAnswer: '`useEffect` is a React Hook that lets you synchronize a component with an external system. It’s used for side effects like data fetching, subscriptions, or manually changing the DOM. It runs after render, and you can control its execution by passing a dependency array, making it run only when specific values change.',
            score: 85
        },
        {
            question: 'What are some common examples of side effects you would manage with `useEffect`?',
            userAnswer: 'Things like fetching data from an API, setting up subscriptions, or manually changing the DOM.',
            feedback: 'Excellent examples! You covered the most common and important use cases for `useEffect`, showing practical knowledge.',
            idealAnswer: 'Common side effects include fetching data from an API, setting up or cleaning up subscriptions (like to a WebSocket), manually manipulating the DOM (though it should be a last resort), and setting a document title. Essentially, any interaction with the world outside of the React component itself.',
            score: 90
        }
    ]
};


export default function InterviewResultsPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [interviewData, setInterviewData] = useState<InterviewActivity | null>(null);
    const [analysis, setAnalysis] = useState<GenerateInterviewFeedbackOutput | null>(null);

    const fetchAndAnalyze = useCallback(async () => {
        const interviewId = params.interviewId as string;

        if (interviewId === 'demo') {
            setInterviewData(demoInterviewData);
            setAnalysis(demoAnalysisData);
            setIsLoading(false);
            return;
        }

        if (!user) return;

        setIsLoading(true);
        try {
            const allActivity = await getActivity(user.uid);
            const currentInterview = allActivity.find(a => a.id === interviewId && a.type === 'interview') as InterviewActivity | undefined || null;
            
            if (!currentInterview) {
                // This might happen on first load after redirect.
                // Give Firestore a moment to catch up.
                await new Promise(resolve => setTimeout(resolve, 1500));
                const freshActivity = await getActivity(user.uid);
                const freshInterview = freshActivity.find(a => a.id === interviewId && a.type === 'interview') as InterviewActivity | undefined || null;
                if (!freshInterview) {
                    setIsLoading(false);
                    return;
                }
                setInterviewData(freshInterview);
            } else {
                setInterviewData(currentInterview);
            }

            const finalInterviewData = interviewData || currentInterview;
            if (!finalInterviewData) {
                setIsLoading(false);
                return;
            }
            
            if (finalInterviewData.analysis && Object.keys(finalInterviewData.analysis).length > 0) {
                setAnalysis(finalInterviewData.analysis);
            } else {
                 setIsAnalyzing(true);
                 try {
                    const feedback = await generateInterviewFeedback({
                        transcript: finalInterviewData.transcript,
                        topic: finalInterviewData.details.topic,
                        role: finalInterviewData.details.role || 'Software Engineer',
                        company: finalInterviewData.details.company,
                    });
                    setAnalysis(feedback);
                    
                    const updatedInterview: InterviewActivity = { ...finalInterviewData, analysis: feedback };
                    await updateActivity(user.uid, updatedInterview);
                    setInterviewData(updatedInterview);

                 } catch(error) {
                    console.error("Failed to generate interview feedback:", error);
                 } finally {
                    setIsAnalyzing(false);
                 }
            }
        } catch (error) {
            console.error("Error on results page:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, params.interviewId, interviewData]);


    useEffect(() => {
        if(user) {
          fetchAndAnalyze();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);


    const handleRetake = () => {
        if (!interviewData || !user) return;
        const { topic, role, level, company } = interviewData.details;
        const meetingId = user.uid + "_" + Date.now();
        const params = new URLSearchParams({ topic, role: role || '', level: level || '' });
        if (company) {
            params.append('company', company);
        }
        router.push(`/dashboard/interview/${meetingId}/instructions?${params.toString()}`);
    }

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
    }

    if (!interviewData) {
         return (
            <main className="p-4 sm:p-6 lg:p-8 overflow-auto">
                <div className="max-w-6xl mx-auto space-y-8 text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Not Found</CardTitle>
                            <CardDescription>We could not find the results for this interview session. It might still be processing.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 items-center">
                             <Button onClick={fetchAndAnalyze}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                             </Button>
                             <Button asChild variant="secondary">
                                <Link href="/dashboard">Back to Dashboard</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
         )
    }

    return (
        <main className="overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                     <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div className="relative rounded-xl shadow-lg p-8 text-center overflow-hidden bg-gradient-to-br from-primary via-blue-500 to-purple-600">
                        <Sparkles className="mx-auto h-12 w-12 text-white mb-4" />
                        <h1 className="font-headline text-4xl font-bold text-white">Interview Analysis</h1>
                        <p className="text-lg text-white/80 mt-2 max-w-2xl mx-auto">
                            Here's a detailed breakdown of your mock interview for the <span className="font-semibold text-white">{interviewData.details.role}</span> role on the topic of <span className="font-semibold text-white">{interviewData.details.topic}</span>.
                            {interviewData.details.company && (
                                <>
                                    <br />Tailored for <span className="font-semibold text-white">{interviewData.details.company}</span>.
                                </>
                            )}
                        </p>
                    </div>
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
                        <div className="grid grid-cols-2 gap-4">
                           <Card className="bg-destructive/10 text-destructive-foreground border-destructive/50">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Overall Score</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{analysis.overallScore}%</div></CardContent>
                           </Card>
                           <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Crack Likelihood</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{analysis.likelihoodToCrack}%</div></CardContent>
                           </Card>
                        </div>
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
                     <Button onClick={handleRetake} size="lg">
                        <RefreshCw className="mr-2 h-4 w-4"/> 
                        Retake Interview
                    </Button>
                </div>
            </div>
        </main>
    )
}
