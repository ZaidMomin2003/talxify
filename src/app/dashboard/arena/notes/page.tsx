'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateStudyNotes, GenerateStudyNotesOutput } from '@/ai/flows/generate-study-notes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BookOpen, BrainCircuit, Code, HelpCircle, Key, Loader2, Star, Lightbulb, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { addActivity, checkAndIncrementUsage, getUserData } from '@/lib/firebase-service';
import type { NoteGenerationActivity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

function StudyNotesLoader() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
            <div className="relative mb-8">
                <div className="h-24 w-24 rounded-3xl border-2 border-primary/20 animate-spin" />
                <BookOpen className="h-12 w-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Synthesizing <span className="text-primary">Intelligence</span></h2>
            <p className="text-muted-foreground font-medium max-w-md mt-4 leading-relaxed">Our AI is distilling complex technical documentation into your personalized masterclass. This might take a few moments...</p>
        </div>
    );
}

function StudyNotesError() {
    return (
        <div className="flex flex-col items-center justify-center p-4 min-h-[80vh]">
            <Card className="max-w-md w-full text-center shadow-2xl rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl border p-10">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-2xl p-4 w-fit mb-6">
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-black italic uppercase text-foreground leading-none">Extraction <span className="text-destructive">Failed</span></CardTitle>
                    <CardDescription className="text-base mt-4">
                        We encountered a temporal anomaly while crafting your study guide. Please attempt a fresh request.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}

function NotesComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topic = searchParams.get('topic');
    const { user } = useAuth();
    const { toast } = useToast();

    const [notes, setNotes] = useState<GenerateStudyNotesOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotes = useCallback(async () => {
        if (!topic) {
            setError("No topic specified.");
            setIsLoading(false);
            return;
        };

        if (!user) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userData = await getUserData(user.uid);
            const existingNoteActivity = userData?.activity
                .filter((a): a is NoteGenerationActivity => a.type === 'note-generation')
                .find(a => a.details.topic.toLowerCase() === topic.toLowerCase());

            if (existingNoteActivity && existingNoteActivity.notes) {
                setNotes(existingNoteActivity.notes);
                setIsLoading(false);
                return;
            }

            const usageCheck = await checkAndIncrementUsage(user.uid, 'aiEnhancements');
            if (!usageCheck.success) {
                toast({ title: "Usage Limit Reached", description: usageCheck.message, variant: "destructive" });
                router.push('/dashboard/pricing');
                return;
            }

            const result = await generateStudyNotes({ topic });
            setNotes(result);

            const activity: NoteGenerationActivity = {
                id: `notes_${Date.now()}`,
                type: 'note-generation',
                timestamp: new Date().toISOString(),
                details: {
                    topic: topic,
                },
                notes: result,
            };
            await addActivity(user.uid, activity);

        } catch (err) {
            console.error("Failed to generate study notes:", err);
            setError("An error occurred while generating notes.");
        } finally {
            setIsLoading(false);
        }
    }, [topic, user, router, toast]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    if (isLoading) return <StudyNotesLoader />;
    if (error || !notes) return <StudyNotesError />;

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <motion.div variants={itemVariants}>
                <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                    <CardHeader className="p-10 md:p-12">
                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                            <div className="p-5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shrink-0 w-fit">
                                <BookOpen className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground">
                                    {notes.topic}
                                </CardTitle>
                                <CardDescription className="text-lg md:text-xl font-medium text-muted-foreground max-w-3xl leading-relaxed">
                                    {notes.introduction}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-10">
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl border overflow-hidden">
                            <CardHeader className="p-8 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-xl font-black uppercase italic tracking-widest flex items-center gap-3 text-foreground">
                                    <BrainCircuit className="h-6 w-6 text-primary" />
                                    Architecture & Concepts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-0">
                                    {notes.coreConcepts.map((concept, index) => (
                                        <AccordionItem
                                            value={`item-${index}`}
                                            key={index}
                                            className="border border-border dark:border-white/5 bg-muted/20 dark:bg-white/[0.02] rounded-2xl px-2 overflow-hidden hover:bg-muted/40 dark:hover:bg-white/[0.04] transition-colors"
                                        >
                                            <AccordionTrigger className="text-lg font-bold py-6 px-4 hover:no-underline text-foreground data-[state=open]:text-primary transition-colors">
                                                {concept.concept}
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-6">
                                                <div
                                                    className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed font-normal"
                                                    dangerouslySetInnerHTML={{ __html: concept.description }}
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl border overflow-hidden">
                            <CardHeader className="p-8 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-xl font-black uppercase italic tracking-widest flex items-center gap-3 text-foreground">
                                    <Code className="h-6 w-6 text-primary" />
                                    Practical Implementation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-10">
                                {notes.examples.map((example, index) => (
                                    <div key={index} className="space-y-4">
                                        <h3 className="font-bold text-lg text-foreground/90 ml-1">{example.title}</h3>
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                            <pre className="relative bg-zinc-950/90 dark:bg-black/60 p-6 rounded-2xl overflow-x-auto text-sm font-code border border-border dark:border-white/10 text-primary-foreground/90 whitespace-pre-wrap">
                                                <code>{example.code}</code>
                                            </pre>
                                        </div>
                                        <div className="flex items-start gap-4 bg-primary/5 rounded-2xl p-6 border border-primary/10 italic">
                                            <div className="mt-1">
                                                <Lightbulb className="h-5 w-5 text-primary" />
                                            </div>
                                            <p className="text-muted-foreground font-medium leading-relaxed">
                                                {example.explanation}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Sidebar Content */}
                <div className="lg:col-span-4 space-y-10">
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl border overflow-hidden">
                            <CardHeader className="p-8 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-lg font-black uppercase italic tracking-widest flex items-center gap-3 text-foreground">
                                    <Key className="h-5 w-5 text-primary" />
                                    Lexicon
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                {notes.terminology.map((term, index) => (
                                    <div key={index} className="space-y-1">
                                        <p className="font-bold text-primary tracking-tight">{term.term}</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{term.definition}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl border overflow-hidden">
                            <CardHeader className="p-8 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-lg font-black uppercase italic tracking-widest flex items-center gap-3 text-foreground">
                                    <Star className="h-5 w-5 text-primary" />
                                    Industry Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {notes.useCases.map((useCase, index) => (
                                    <div key={index} className="flex items-start gap-4 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform" />
                                        <p className="text-muted-foreground font-medium text-sm leading-relaxed">{useCase}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl border overflow-hidden">
                            <CardHeader className="p-8 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-lg font-black uppercase italic tracking-widest flex items-center gap-3 text-foreground">
                                    <HelpCircle className="h-5 w-5 text-primary" />
                                    Interview Prep
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Accordion type="single" collapsible className="w-full space-y-2">
                                    {notes.interviewQuestions.map((qa, index) => (
                                        <AccordionItem
                                            value={`item-${index}`}
                                            key={index}
                                            className="border-none bg-muted/50 dark:bg-white/5 rounded-xl px-2 overflow-hidden"
                                        >
                                            <AccordionTrigger className="text-sm font-bold py-4 px-2 text-left hover:no-underline text-foreground/90">
                                                {qa.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="px-2 pb-4 text-muted-foreground text-sm leading-relaxed font-medium">
                                                {qa.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function NotesPage() {
    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            <div className="relative z-10">
                <Suspense fallback={<StudyNotesLoader />}>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <NotesComponent />
                    </motion.div>
                </Suspense>
            </div>
        </main>
    )
}
