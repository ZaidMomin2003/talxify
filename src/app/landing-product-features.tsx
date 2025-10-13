
'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, BarChart, BookOpen, BrainCircuit, CalendarDays, CheckCircle, Code, MessageSquare, Mic, Sparkles, User, Video, VideoOff, Phone } from "lucide-react";
import Image from "next/image";

const features = [
    {
        title: 'Your Personalized 60-Day Prep Plan',
        description: 'Start with a plan tailored to your target roles and companies. Our AI generates a comprehensive, 60-day syllabus covering everything from data structures to system design, ensuring you learn what matters most.',
        icon: CalendarDays,
        prototype: (
            <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl border border-border/50">
                <CardHeader className="p-0 mb-4 flex flex-row items-center gap-3">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-lg"><CalendarDays className="w-6 h-6"/></div>
                    <CardTitle className="text-xl m-0">Your 60-Day Arena</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-green-500/50">
                        <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span className="font-medium">Day 1: Arrays & Strings</span></div>
                        <Badge variant="default" className="bg-green-600/80">Done</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/50 ring-2 ring-primary/30">
                        <div className="flex items-center gap-3"><ArrowRight className="w-5 h-5 text-primary" /> <span className="font-medium">Day 2: Linked Lists</span></div>
                        <Button size="sm">Start</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 opacity-60">
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
             <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl border border-border/50 overflow-hidden">
                <CardHeader className="p-0 mb-4 flex-row items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-lg text-primary"><BookOpen className="w-6 h-6" /></div>
                    <CardTitle className="text-xl m-0">React Hooks</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <p className="text-sm text-muted-foreground">An introduction to the core concepts of React Hooks, including useState, useEffect, and custom hooks for managing component state and side effects.</p>
                    <div className="p-3 rounded-lg bg-muted border">
                        <p className="font-semibold text-sm">Core Concept: useState</p>
                        <p className="text-xs text-muted-foreground mt-1">The `useState` hook allows you to add state to functional components...</p>
                    </div>
                     <div className="p-3 rounded-lg bg-muted border opacity-70">
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
             <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl border border-border/50">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg">Question 1: Reverse a String</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div className="h-32 bg-muted rounded-md p-3 font-mono text-sm border">
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
            <div className="w-full max-w-lg mx-auto aspect-video rounded-2xl p-4 shadow-xl border border-border/50 bg-background relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 thermal-gradient-bg z-0"/>
                <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className={cn("relative flex items-center justify-center w-32 h-32 rounded-full transition-all duration-500 scale-100")}>
                        <div className={cn("absolute inset-0 rounded-full bg-primary/10 animate-pulse duration-1000")}/>
                        <div className={cn("absolute inset-2 rounded-full bg-primary/20 animate-pulse duration-1500")}/>
                        <Avatar className="w-24 h-24 border-4 border-background">
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                <BrainCircuit className="w-12 h-12" />
                            </div>
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                    </div>
                    <p className="mt-4 text-xl font-bold font-headline text-foreground">Kathy</p>
                    <p className="text-sm text-muted-foreground">AI Interviewer</p>
                </div>
                <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-black shadow-lg flex items-center justify-center">
                    <Video className="w-8 h-8 text-muted-foreground"/>
                </div>
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-background/50 border p-2 backdrop-blur-md">
                    <Button size="icon" className="w-10 h-10 rounded-full" variant={'secondary'}><Mic /></Button>
                    <Button size="icon" className="w-10 h-10 rounded-full" variant={'secondary'}><Video /></Button>
                    <Button size="icon" className="w-10 h-10 rounded-full" variant={'destructive'}><Phone /></Button>
                </div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-2 bg-background/50 border rounded-full px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                        <span>Your turn... Speak now.</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: 'In-Depth Performance Analytics',
        description: 'Track your progress with a comprehensive dashboard. Analyze your quiz scores over time, identify your weakest concepts, and review transcripts from past interviews to pinpoint areas for improvement.',
        icon: BarChart,
        prototype: (
            <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl border border-border/50">
                 <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl">Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div className="h-28 w-full rounded-md bg-muted/50 border flex items-end p-2 gap-2">
                        <div className="w-1/4 h-1/2 bg-primary/30 rounded-t-sm animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1/4 h-3/4 bg-primary/50 rounded-t-sm animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1/4 h-2/3 bg-primary/40 rounded-t-sm animate-pulse" style={{animationDelay: '0.3s'}}></div>
                        <div className="w-1/4 h-full bg-primary/60 rounded-t-sm animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <div className="text-sm text-muted-foreground">Your average score is up <span className="font-semibold text-green-500">12%</span> this week.</div>
                </CardContent>
            </Card>
        )
    },
];

export default function LandingProductFeatures() {
  return (
    <section id="features" className="bg-transparent py-16 sm:py-24">
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
