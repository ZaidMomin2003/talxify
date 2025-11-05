
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getActivity } from '@/lib/firebase-service';
import type { InterviewQuestionSetActivity, InterviewQuestionAndAnswer } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, ChevronLeft, MessageSquare, Sparkles, Lightbulb, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ResultsLoader() {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold">Loading Questions...</h2>
                <p className="text-muted-foreground">Fetching your generated question set.</p>
            </div>
        </div>
    );
}

function ResultsError() {
    return (
        <div className="flex h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Could Not Load Questions</CardTitle>
                    <CardDescription>
                        The requested question set could not be found or has been corrupted. Please try generating a new set.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <a href="/dashboard/interview-questions-generator">Back to Generator</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function InterviewQuestionsResultPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [activity, setActivity] = useState<InterviewQuestionSetActivity | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivity = useCallback(async (id: string) => {
        if (!user) return;
        setIsLoading(true);

        try {
            const activities = await getActivity(user.uid);
            const foundActivity = activities.find(a => a.id === id && a.type === 'interview-question-set') as InterviewQuestionSetActivity | undefined;
            if (foundActivity) {
                setActivity(foundActivity);
            } else {
                setActivity(null); // Explicitly set to null if not found
            }
        } catch (error) {
            console.error(error);
            setActivity(null);
        } finally {
            setIsLoading(false);
        }

    }, [user]);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            fetchActivity(id);
        } else {
            setIsLoading(false);
        }
    }, [searchParams, fetchActivity]);

    if (isLoading) return <ResultsLoader />;
    if (!activity) return <ResultsError />;

    const { role, level, company } = activity.details;

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/interview-questions-generator')}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Generator
                </Button>
                
                <Card className="shadow-lg">
                    <CardHeader>
                         <div className="flex items-center gap-4 mb-2">
                             <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-bold font-headline">Interview Questions</CardTitle>
                                <CardDescription className="text-lg">AI-generated questions for a {level} {role} role{company && ` at ${company}`}.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {activity.questions.questions.map((qa, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg text-left hover:no-underline">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4">
                                    <span className="flex-1 mb-2 sm:mb-0">{index + 1}. {qa.question}</span>
                                    <Badge 
                                        variant={
                                            qa.type === 'Behavioral' ? 'secondary' : 
                                            qa.type === 'Coding' ? 'destructive' : 'default'
                                        }
                                        className="w-fit"
                                    >
                                        {qa.type}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground space-y-6 p-4 bg-muted/50 rounded-b-lg">
                                <Alert>
                                    <Lightbulb className="h-4 w-4" />
                                    <AlertTitle>How to Answer</AlertTitle>
                                    <AlertDescription>
                                        <div dangerouslySetInnerHTML={{ __html: qa.guidance }} />
                                    </AlertDescription>
                                </Alert>
                                <Alert variant="default" className="bg-background">
                                     <UserCheck className="h-4 w-4" />
                                    <AlertTitle>Example Answer</AlertTitle>
                                    <AlertDescription>
                                        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: qa.exampleAnswer }} />
                                    </AlertDescription>
                                </Alert>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </main>
    );
}
