
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, AlertTriangle, ChevronLeft, Bot, User, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function TranscriptLoader() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold">Loading Transcript...</h2>
                <p className="max-w-md text-muted-foreground">Fetching your interview conversation from the database.</p>
            </div>
        </div>
    );
}

function TranscriptError({ message }: { message: string }) {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Failed to Load Transcript</CardTitle>
                    <CardDescription>
                        {message || "We couldn't find the interview transcript. Please try again later or return to your dashboard."}
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

export default function TranscriptPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    
    const interviewId = params.interviewId as string;
    const [interview, setInterview] = useState<InterviewActivity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInterviewData = useCallback(async () => {
        if (!user || !interviewId) return;
        setIsLoading(true);
        setError(null);
        
        try {
            const userActivity = await getActivity(user.uid);
            const currentInterview = userActivity.find(a => a.id === interviewId && a.type === 'interview') as InterviewActivity | undefined;

            if (!currentInterview) {
                setError("Interview transcript not found.");
            } else {
                setInterview(currentInterview);
            }
        } catch (e: any) {
            console.error("Error fetching interview data:", e);
            setError(`Failed to load interview transcript: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [user, interviewId]);

    useEffect(() => {
        fetchInterviewData();
    }, [fetchInterviewData]);

    if (isLoading) return <TranscriptLoader />;
    if (error || !interview) return <TranscriptError message={error || "Interview data is missing."} />;

    const canViewResults = interview.feedback !== "Feedback has not been generated for this interview." || interview.analysis;

    return (
        <main className="p-4 sm:p-6 lg:p-8 bg-muted/30 min-h-screen">
            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/arena')}>
                    <ChevronLeft className="mr-2 h-4 w-4"/> Back to Arena
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold font-headline">Interview Transcript</CardTitle>
                        <CardDescription>
                            A record of your conversation for the topic: <span className="font-semibold text-primary">{interview.details.topic}</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {interview.transcript && interview.transcript.length > 0 ? (
                             <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                                {interview.transcript.map((entry: TranscriptEntry, index: number) => (
                                    <div key={index} className={`flex items-start gap-4 ${entry.speaker === 'user' ? 'justify-end' : ''}`}>
                                        {entry.speaker === 'ai' && (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <Bot className="w-6 h-6"/>
                                            </div>
                                        )}
                                        <div className={`rounded-xl p-4 max-w-lg shadow-sm ${entry.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                                            <p>{entry.text}</p>
                                        </div>
                                        {entry.speaker === 'user' && (
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                <User className="w-6 h-6"/>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">The transcript for this interview is empty.</p>
                        )}
                    </CardContent>
                     <CardFooter>
                        <Button asChild className="w-full" disabled={!canViewResults}>
                            <Link href={`/dashboard/interview/${interviewId}/results`}>
                                <BarChart className="mr-2 h-4 w-4" />
                                View Performance Report
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}
