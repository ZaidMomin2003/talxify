
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, BarChart, BookOpen, BrainCircuit, CalendarDays, CheckCircle, Code, MessageSquare, Mic, Sparkles, User, Video, VideoOff } from "lucide-react";
import Image from "next/image";

const features = [
    {
        title: 'Your Personalized 30-Day Prep Plan',
        description: 'Start with a plan tailored to your target roles and companies. Our AI generates a comprehensive, 30-day syllabus covering everything from data structures to system design, ensuring you learn what matters most.',
        icon: CalendarDays,
        prototype: (
            <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl">Your 30-Day Arena</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-green-500/50">
                        <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span className="font-medium">Day 1: Arrays & Strings</span></div>
                        <Badge variant="default">Done</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/50">
                        <div className="flex items-center gap-3"><ArrowRight className="w-5 h-5 text-primary" /> <span className="font-medium">Day 2: Linked Lists</span></div>
                        <Button size="sm">Start</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 opacity-60">
                        <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5" /> <span className="font-medium">Day 3: Hash Tables</span></div>
                        <Badge variant="secondary">Locked</Badge>
                    </div>
                </CardContent>
            </Card>
        )
    },
    {
        title: 'AI-Generated Study Notes',
        description: "Don't just memorize—understand. Select any topic from your syllabus, and our AI will generate a detailed, easy-to-digest study guide, complete with core concepts, key terminology, and practical code examples.",
        icon: BookOpen,
        prototype: (
             <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl overflow-hidden">
                <CardHeader className="p-0 mb-4 flex-row items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-lg text-primary"><BookOpen className="w-6 h-6" /></div>
                    <CardTitle className="text-xl m-0">React Hooks</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <p className="text-sm text-muted-foreground">An introduction to the core concepts of React Hooks, including useState, useEffect, and custom hooks for managing component state and side effects.</p>
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Core Concept: useState</p>
                        <p className="text-xs text-muted-foreground mt-1">The `useState` hook allows you to add state to functional components...</p>
                    </div>
                     <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Core Concept: useEffect</p>
                    </div>
                </CardContent>
            </Card>
        )
    },
    {
        title: 'Interactive Coding Quizzes',
        description: 'Test your knowledge with AI-generated coding challenges. Write your solution in our editor and get instant, in-depth feedback on correctness, efficiency, and code style, along with an optimal solution.',
        icon: Code,
        prototype: (
             <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg">Question 1: Reverse a String</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div className="h-28 bg-muted rounded-md p-3 font-mono text-xs text-muted-foreground">
                        <span className="text-primary">function</span> <span className="text-foreground">reverseString</span>(<span className="text-yellow-400">str</span>) {"{"} <br/>
                        &nbsp;&nbsp;<span className="text-gray-500">// Your code here...</span><br/>
                        {"}"}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary">Get Hint</Button>
                        <Button>Submit</Button>
                    </div>
                </CardContent>
            </Card>
        )
    },
    {
        title: 'Human-Like AI Interviews',
        description: "Experience a realistic, voice-based mock interview. Our conversational AI asks relevant technical and behavioral questions, listens to your answers, and responds dynamically, just like a real interviewer.",
        icon: MessageSquare,
        prototype: (
             <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-4 shadow-xl">
                <div className="aspect-video bg-muted rounded-lg relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                         <User className="w-24 h-24 text-white/20" />
                    </div>
                    <div className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white text-xs flex items-center gap-1.5"><User className="w-3 h-3"/> You</div>
                    
                    <div className="absolute bottom-4 left-4 w-1/3 aspect-video bg-black/50 border border-primary/50 rounded-lg flex flex-col items-center justify-center p-2">
                        <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                        <div className="text-white text-xs mt-1">AI Interviewer</div>
                    </div>

                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <Button size="icon" variant="secondary" className="rounded-full h-10 w-10"><Mic className="w-5 h-5"/></Button>
                        <Button size="icon" variant="secondary" className="rounded-full h-10 w-10"><Video className="w-5 h-5"/></Button>
                        <Button size="icon" variant="destructive" className="rounded-full h-10 w-10"><Mic className="w-5 h-5"/></Button>
                    </div>
                </div>
            </Card>
        )
    },
    {
        title: 'In-Depth Performance Analytics',
        description: 'Track your progress with a comprehensive dashboard. Analyze your quiz scores over time, identify your weakest concepts, and review transcripts from past interviews to pinpoint areas for improvement.',
        icon: BarChart,
        prototype: (
            <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl">
                 <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl">Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div className="h-24 w-full rounded-md bg-muted/50 flex items-end p-2">
                        {/* Fake bar chart */}
                        <div className="w-1/4 h-1/2 bg-primary/30 rounded-t-sm animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1/4 h-3/4 bg-primary/50 rounded-t-sm ml-2 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1/4 h-2/3 bg-primary/40 rounded-t-sm ml-2 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                        <div className="w-1/4 h-full bg-primary/60 rounded-t-sm ml-2 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <div className="text-sm text-muted-foreground">Your average score is up <span className="font-semibold text-green-500">12%</span> this week.</div>
                </CardContent>
            </Card>
        )
    },
];

export default function LandingProductFeatures() {
  return (
    <section id="features" className="bg-background py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center">
          <Badge
            variant="outline"
            className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
          >
            Product Features
          </Badge>
          <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
            A Better Way to Prepare
          </h2>
          <p className="text-muted-foreground max-w-2xl text-center">
            Talxify combines a structured learning path with powerful AI tools to give you the ultimate interview prep experience.
          </p>
        </div>

        <div className="space-y-24">
            {features.map((feature, index) => (
                <div key={feature.title} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className={cn("prose prose-lg dark:prose-invert", index % 2 === 1 && "lg:order-2")}>
                         <div className="flex items-center gap-4 mb-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-full">
                                <feature.icon className="w-6 h-6"/>
                            </div>
                            <h3 className="m-0 font-headline text-3xl font-bold">{feature.title}</h3>
                         </div>
                         <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                    <div className={cn("flex items-center justify-center", index % 2 === 1 && "lg:order-1")}>
                        <div className="bg-card/50 rounded-xl border p-4 shadow-lg w-full">
                            {feature.prototype}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
