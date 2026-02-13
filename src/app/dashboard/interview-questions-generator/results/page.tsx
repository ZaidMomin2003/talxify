
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

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

function ResultsLoader() {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="h-20 w-20 rounded-2xl border-2 border-primary/20 animate-spin" />
                    <Loader2 className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Assembling <span className="text-primary">Intel</span></h2>
                    <p className="text-muted-foreground font-medium">Synthesizing tailored technical questions...</p>
                </div>
            </div>
        </div>
    );
}

function ResultsError() {
    return (
        <div className="flex h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-md text-center shadow-2xl rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl border p-8">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-2xl p-4 w-fit mb-4">
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase italic tracking-tight text-white leading-none">Access <span className="text-destructive">Denied</span></CardTitle>
                    <CardDescription className="text-base mt-2">
                        The requested assessment could not be retrieved from the records.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <Button asChild className="rounded-xl font-bold uppercase tracking-widest text-[10px] w-full h-12">
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
                setActivity(null);
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
        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-4xl mx-auto space-y-8 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard/interview-questions-generator')}
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-white"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Return to Generator
                    </Button>
                </div>

                <motion.div variants={itemVariants}>
                    <Card className="rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                        <CardHeader className="p-8 md:p-10">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 shrink-0 w-fit">
                                    <Sparkles className="h-10 w-10" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2">
                                            {level.replace('-', ' ')}
                                        </Badge>
                                        {company && (
                                            <Badge variant="outline" className="border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest px-2">
                                                Target: {company}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white leading-none">
                                        Assessment <span className="text-primary">Results</span>
                                    </CardTitle>
                                    <CardDescription className="text-base font-medium">Expertized technical deep-dive for {role}.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-0">
                        {activity.questions.questions.map((qa, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="border border-white/10 bg-black/40 backdrop-blur-xl rounded-[1.5rem] px-2 overflow-hidden hover:bg-white/[0.02] transition-colors"
                            >
                                <AccordionTrigger className="text-lg text-left hover:no-underline py-6 px-4 group">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                                        <div className="flex items-start gap-4">
                                            <span className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-black text-primary italic">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <span className="font-bold text-white group-data-[state=open]:text-primary transition-colors leading-tight pr-4">
                                                {qa.question}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={
                                                qa.type === 'Behavioral' ? 'secondary' :
                                                    qa.type === 'Coding' ? 'destructive' : 'default'
                                            }
                                            className="w-fit h-6 text-[9px] font-black uppercase tracking-widest px-3 rounded-lg ml-12 sm:ml-0"
                                        >
                                            {qa.type}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-base space-y-6 pt-2 pb-8 px-4">
                                    <div className="grid grid-cols-1 gap-6 ml-12 pr-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary italic">
                                                <Lightbulb className="h-3 w-3" />
                                                Strategic Guidance
                                            </div>
                                            <div
                                                className="text-muted-foreground font-medium leading-relaxed bg-white/5 rounded-2xl p-6 border border-white/5"
                                                dangerouslySetInnerHTML={{ __html: qa.guidance }}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white italic">
                                                <UserCheck className="h-3 w-3" />
                                                Elite Response
                                            </div>
                                            <div
                                                className="prose dark:prose-invert max-w-none text-white/80 font-medium bg-primary/5 rounded-2xl p-6 border border-primary/5 italic"
                                                dangerouslySetInnerHTML={{ __html: qa.exampleAnswer }}
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </motion.div>
        </main>
    );
}
