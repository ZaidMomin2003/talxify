
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, Bot, CheckCircle, ChevronLeft, MessageSquare, Mic, Sparkles, User, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';


// Dummy data for demonstration purposes
const dummyResults = {
    overallScore: 82,
    summary: "Great job on the technical questions! You demonstrated a solid understanding of React's core concepts. Key areas for improvement include providing more structured answers for behavioral questions and elaborating on your thought process during problem-solving.",
    strengths: ["React Hooks", "State Management", "Technical Accuracy"],
    areasForImprovement: ["Behavioral Answers (STAR method)", "Communication Clarity"],
    questions: [
        {
            questionText: "Can you explain the concept of the Virtual DOM in React and why it's beneficial for performance?",
            userAnswer: "Uh, yeah, so the Virtual DOM is like a copy of the real DOM. When state changes, React updates the copy, compares it to the real one, and only updates what's necessary. It's faster because manipulating the actual DOM is slow.",
            feedback: "Your understanding is correct. To improve, try to structure your answer more formally. You could start with a clear definition, explain the reconciliation process, and then detail the performance benefits, such as reduced DOM manipulation and batching updates.",
            idealAnswer: "The Virtual DOM (VDOM) is a programming concept where a virtual representation of a UI is kept in memory and synced with the 'real' DOM. When a component's state changes, React creates a new VDOM tree. It then diffs this new tree with the previous one and calculates the most efficient way to apply these changes to the real DOM. This process, called reconciliation, is beneficial for performance because direct DOM manipulation is computationally expensive. By batching updates and minimizing direct interactions with the browser's DOM, React significantly improves rendering speed and application performance.",
            score: 85,
        },
        {
            questionText: "Describe a time you faced a difficult technical challenge and how you solved it.",
            userAnswer: "There was this bug that took forever to solve. It was something with an API. I just kept trying things until it worked. I used console.log a lot.",
            feedback: "This is a good start, but behavioral questions are best answered using the STAR (Situation, Task, Action, Result) method. You mentioned the situation (a difficult bug) and the action (debugging), but you could elaborate on the task's complexity and the specific, positive result of your actions.",
            idealAnswer: "In my previous project (Situation), I was tasked with integrating a third-party payment gateway that had sparse and outdated documentation (Task). I took a multi-step approach: first, I used tools like Postman to interact with the API endpoints directly to understand their behavior. Next, I built a small, isolated prototype to test the integration logic. Finally, I implemented it into the main application with extensive error handling (Action). As a result, the integration was completed ahead of schedule, and we reduced payment processing errors by 15% in the first month (Result).",
            score: 68,
        },
        {
            questionText: "What is the difference between `useState` and `useReducer` in React?",
            userAnswer: "useState is for simple state, like a number or a string. useReducer is for more complex state, like an object with many fields. You use it with a dispatch function.",
            feedback: "This is a concise and accurate summary. You correctly identified the primary use case for each hook. To make the answer even stronger, you could briefly mention that `useReducer` is often preferable when the next state depends on the previous one or when state logic is complex and needs to be managed outside the component.",
            idealAnswer: "`useState` is the basic hook for managing local state in a component and is ideal for simple state values like booleans, strings, or numbers. `useReducer` is an alternative that is generally preferred for managing more complex state logic. It accepts a reducer function and an initial state, returning the current state and a `dispatch` function. It's particularly useful when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one, as it allows you to consolidate state update logic outside the component for better maintainability and testability.",
            score: 93,
        }
    ]
};

export default function InterviewResultsPage() {
    const router = useRouter();
    const results = dummyResults;

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
                                Here's a detailed breakdown of your mock interview performance.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>Overall Score</CardTitle>
                             </CardHeader>
                             <CardContent className="text-center">
                                 <span className="text-7xl font-bold text-primary">{results.overallScore}</span>
                                 <span className="text-3xl text-muted-foreground">%</span>
                             </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><Bot className="h-6 w-6"/> AI Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground text-base">{results.summary}</p>
                                <div className="bg-green-500/10 p-4 rounded-lg">
                                    <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">Strengths</h3>
                                    <ul className="space-y-1">
                                        {results.strengths.map(item => (
                                            <li key={item} className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-amber-500/10 p-4 rounded-lg">
                                    <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Areas for Improvement</h3>
                                    <ul className="space-y-1">
                                        {results.areasForImprovement.map(item => (
                                            <li key={item} className="flex items-center gap-2 text-sm">
                                                <XCircle className="h-4 w-4 text-amber-500" />
                                                {item}
                                            </li>
                                        ))}
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
                            {results.questions.map((q, index) => (
                                <AccordionItem value={`item-${index}`} key={index} asChild>
                                    <Card className="overflow-hidden">
                                        <AccordionTrigger className="flex justify-between items-center w-full p-6 text-lg text-left hover:no-underline data-[state=open]:border-b">
                                            <span className="truncate flex-1 pr-4">Question {index + 1}: {q.questionText}</span>
                                            <div className="ml-4 flex items-center gap-2 shrink-0">
                                                <Badge variant={q.score > 80 ? 'default' : q.score > 60 ? 'secondary' : 'destructive'}>{q.score}%</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-6 pt-4 space-y-6 bg-muted/30">
                                                <div>
                                                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><User className="h-5 w-5 text-blue-500"/> Your Answer</h3>
                                                    <blockquote className="p-4 bg-background rounded-md italic text-muted-foreground border-l-4 border-blue-500">{q.userAnswer}</blockquote>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Bot className="h-5 w-5 text-primary"/> AI Feedback</h3>
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

                <div className="text-center pt-8">
                    <Button onClick={() => router.push('/dashboard/interview/setup')} size="lg">
                       <Mic className="mr-2 h-4 w-4"/> Try Another Interview
                    </Button>
                </div>
            </div>
        </main>
    )
}
