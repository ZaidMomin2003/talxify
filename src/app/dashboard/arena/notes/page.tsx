
'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateStudyNotes, GenerateStudyNotesOutput } from '@/ai/flows/generate-study-notes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BookOpen, BrainCircuit, Code, HelpCircle, Key, Loader2, Star, Lightbulb } from 'lucide-react';

function StudyNotesLoader() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-3xl font-bold font-headline text-foreground">Generating Your Study Guide</h2>
            <p className="text-lg text-muted-foreground max-w-md mt-2">Our AI is crafting a personalized study guide for you. This might take a few moments...</p>
        </div>
    );
}

function StudyNotesError() {
     return (
        <div className="flex h-full w-full flex-col items-center justify-center p-4 min-h-[60vh]">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Failed to Generate Notes</CardTitle>
                    <CardDescription>
                        We encountered an error while creating your study guide. Please try again later.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}

function NotesComponent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  
  const [notes, setNotes] = useState<GenerateStudyNotesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!topic) {
        setError("No topic specified.");
        setIsLoading(false);
        return;
    };
    
    setIsLoading(true);
    setError(null);
    try {
        const result = await generateStudyNotes({ topic });
        setNotes(result);
    } catch (err) {
        console.error("Failed to generate study notes:", err);
        setError("An error occurred while generating notes.");
    } finally {
        setIsLoading(false);
    }
  }, [topic]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (isLoading) return <StudyNotesLoader />;
  if (error || !notes) return <StudyNotesError />;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <Card className="shadow-lg border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                             <BookOpen className="h-8 w-8" />
                        </div>
                        <div>
                             <CardTitle className="text-4xl font-bold font-headline">{notes.topic}</CardTitle>
                             <CardDescription className="text-lg">{notes.introduction}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Core Concepts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><BrainCircuit className="h-6 w-6"/> Core Concepts</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                             {notes.coreConcepts.map((concept, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className="text-lg">{concept.concept}</AccordionTrigger>
                                    <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                        <ul className="list-disc pl-5 space-y-2">
                                           {concept.description.split('\n').map((point, i) => point.trim() && <li key={i}>{point.replace(/^- /, '')}</li>)}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                             ))}
                           </Accordion>
                        </CardContent>
                    </Card>

                    {/* Examples */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><Code className="h-6 w-6"/> Practical Examples</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {notes.examples.map((example, index) => (
                                <div key={index}>
                                    <h3 className="font-semibold text-lg mb-2">{example.title}</h3>
                                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-code mb-2"><code>{example.code}</code></pre>
                                    <Alert>
                                        <Lightbulb className="h-4 w-4" />
                                        <AlertTitle>Explanation</AlertTitle>
                                        <AlertDescription>
                                            {example.explanation}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Key Terminology */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><Key className="h-6 w-6"/> Key Terminology</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {notes.terminology.map((term, index) => (
                                <div key={index}>
                                    <p className="font-semibold text-foreground">{term.term}</p>
                                    <p className="text-sm text-muted-foreground">{term.definition}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Use Cases */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><Star className="h-6 w-6"/> Common Use Cases</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {notes.useCases.map((useCase, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                    <p className="text-muted-foreground flex-1">{useCase}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Interview Questions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><HelpCircle className="h-6 w-6"/> Interview Prep</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full">
                                {notes.interviewQuestions.map((qa, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>{qa.question}</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            {qa.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                             </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </main>
  );
}

export default function NotesPage() {
    return (
        <Suspense fallback={<StudyNotesLoader />}>
            <NotesComponent />
        </Suspense>
    )
}
