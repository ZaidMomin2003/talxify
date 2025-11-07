
'use client';

import React from 'react';
import LandingHeader from '../landing-header';
import LandingFooter from '../landing-footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, BookOpen, Bot, Briefcase, CheckCircle, ChevronDown, Code, FileText, Globe, GraduationCap, Users, Swords, ShieldQuestion, ListChecks, CalendarDays, MessageSquare, Sparkles, BrainCircuit, Video, Phone, Mic, AlertTriangle, UserCheck, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CalEmbed from './cal-embed';


const failures = [
    {
        title: "1. Overlooking Edge Cases",
        problem: "Students often write code for the 'happy path' but fail to consider inputs like empty arrays, null values, or very large numbers.",
        interviewImpact: "In an interview, this looks like a lack of thoroughness. The interviewer has to prompt them ('What if the input is null?'), which signals a junior mindset and a lack of production readiness.",
        solution: "Talxify's Code Izanami quizzes automatically test submissions against a comprehensive suite of hidden edge cases. Our AI feedback explicitly points out which cases failed and why, training students to think defensively."
    },
    {
        title: "2. Inefficient, Brute-Force Solutions",
        problem: "Many students default to nested loops (O(n²)) when a more efficient O(n) or O(n log n) solution exists, a major red flag for interviewers.",
        interviewImpact: "Presenting a brute-force solution without acknowledging its inefficiency suggests a weak grasp of time/space complexity. Top candidates often identify the brute-force path first, but immediately discuss how to optimize it.",
        solution: "Our AI analysis doesn't just check for correctness; it evaluates efficiency. The feedback suggests more optimal approaches (like using hashmaps) and provides a well-commented, optimal solution for comparison."
    },
    {
        title: "3. Poor Code Quality & Structure",
        problem: "Unreadable code with poor variable names (e.g., `i`, `j`, `temp`), and monolithic blocks of logic are common.",
        interviewImpact: "This signals an inability to write maintainable code for a team. Interviewers see this as a sign that the candidate would be difficult to collaborate with and that their code would be costly to maintain.",
        solution: "The AI feedback provides direct comments on code style, structure, and readability. It encourages breaking down problems into smaller functions and adhering to industry-standard naming conventions."
    },
    {
        title: "4. Vague Behavioral Answers",
        problem: "When asked behavioral questions ('Tell me about a time...'), students often give generic, rambling answers without structure.",
        interviewImpact: "This is a missed opportunity to showcase soft skills like leadership and teamwork. Interviewers are looking for clear, concise stories of impact, not just a list of responsibilities.",
        solution: "Talxify's AI Interviewer is trained to ask behavioral questions. The detailed feedback analyzes the structure and content of the answer, guiding students to use frameworks like the STAR method to tell compelling stories."
    },
    {
        title: "5. Weak Problem Comprehension",
        problem: "A frequent issue is jumping into coding before fully understanding the problem constraints and requirements, leading to solutions that don't meet the prompt's criteria.",
        interviewImpact: "This shows poor communication and analytical skills. The candidate wastes valuable time building the wrong thing, forcing the interviewer to redirect them, which rarely ends well.",
        solution: "Our AI-generated questions are designed to be clear and specific, mimicking real interview prompts. The structured environment encourages students to read carefully, and feedback penalizes solutions that misunderstand the core task."
    },
]


const features = [
    {
        title: 'Human-Like AI Interviews',
        description: "Experience a realistic, voice-based mock interview. Our conversational AI asks relevant technical and behavioral questions, listens to your answers, and responds dynamically, just like a real interviewer.",
        icon: MessageSquare,
        prototype: (
            <div className="w-full max-w-lg mx-auto aspect-video rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl border border-border/50 bg-background relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 thermal-gradient-bg z-0"/>
                <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className={cn("relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full transition-all duration-500 scale-100")}>
                        <div className={cn("absolute inset-0 rounded-full bg-primary/10 animate-pulse duration-1000")}/>
                        <div className={cn("absolute inset-2 rounded-full bg-primary/20 animate-pulse duration-1500")}/>
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-background">
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                <BrainCircuit className="w-10 h-10 sm:w-12 sm:h-12" />
                            </div>
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                    </div>
                    <p className="mt-2 sm:mt-4 text-lg sm:text-xl font-bold font-headline text-foreground">Mark</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">AI Interviewer</p>
                </div>
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-border bg-black shadow-lg flex items-center justify-center">
                    <Video className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground"/>
                </div>
                 <div className="absolute bottom-2 left-1/2 sm:bottom-4 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-background/50 border p-1 sm:p-2 backdrop-blur-md">
                    <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" variant={'secondary'}><Mic className="w-4 h-4 sm:w-auto"/></Button>
                    <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" variant={'secondary'}><Video className="w-4 h-4 sm:w-auto"/></Button>
                    <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" variant={'destructive'}><Phone className="w-4 h-4 sm:w-auto"/></Button>
                </div>
                <div className="absolute top-1 left-1/2 sm:top-2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-2 bg-background/50 border rounded-full px-3 py-1 text-[10px] sm:text-xs text-muted-foreground backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                        <span>Your turn... Speak now.</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: 'Interactive Coding Quizzes (Code Izanami)',
        description: 'Test knowledge with AI-generated coding challenges. Write solutions in our editor and get instant, in-depth feedback on correctness, efficiency, and code style, along with an optimal solution.',
        icon: ShieldQuestion,
        prototype: (
             <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-xl border border-border/50">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-base sm:text-lg">Question 1: Reverse a String</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div className="h-24 sm:h-32 bg-muted rounded-md p-3 font-mono text-xs sm:text-sm border">
                        <span className="text-primary">function</span> <span className="text-foreground">reverseString</span>(<span className="text-yellow-400">str</span>) {"{"} <br/>
                        &nbsp;&nbsp;<span className="text-gray-500">// Your code here...</span><br/>
                        {"}"}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm">Get Hint</Button>
                        <Button size="sm">Submit</Button>
                    </div>
                </CardContent>
            </Card>
        )
    },
    {
        title: 'AI Interview Question Bank',
        description: 'Generate hyper-relevant questions for any role. Our AI analyzes job descriptions to create technical, behavioral, and coding questions with detailed example answers, tailored to the required seniority.',
        icon: BrainCircuit,
        prototype: (
            <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-xl border border-border/50">
                 <CardHeader className="p-0 mb-4 flex flex-row items-center gap-3">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-lg"><BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6"/></div>
                    <CardTitle className="text-lg sm:text-xl m-0">Generated Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2 sm:space-y-3">
                    <div className="p-3 rounded-lg bg-muted border">
                        <Badge variant="destructive" className="mb-2 text-xs">Coding</Badge>
                        <p className="font-medium text-xs sm:text-sm">Implement an algorithm to find the maximum contiguous subarray sum (Kadane's Algorithm).</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border opacity-70">
                         <Badge variant="secondary" className="mb-2 text-xs">Behavioral</Badge>
                        <p className="font-medium text-xs sm:text-sm">Tell me about a time you had to take ownership of a failing project.</p>
                    </div>
                </CardContent>
            </Card>
        )
    },
    {
        title: 'AI-Generated Study Notes',
        description: "Don't just memorize—understand. Select any topic, and our AI will generate a detailed, easy-to-digest study guide, complete with core concepts, key terminology, and practical code examples.",
        icon: BookOpen,
        prototype: (
             <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-xl border border-border/50 overflow-hidden">
                <CardHeader className="p-0 mb-4 flex-row items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-lg text-primary"><BookOpen className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <CardTitle className="text-lg sm:text-xl m-0">React Hooks</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2 sm:space-y-3">
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
        title: 'In-Depth Performance Analytics',
        description: 'Track progress with a comprehensive dashboard. Analyze quiz scores, identify weak concepts, and review interview transcripts to pinpoint areas for improvement.',
        icon: BarChart,
        prototype: (
            <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-xl border border-border/50">
                 <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg sm:text-xl">Performance Analysis</CardTitle>
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
     {
        title: 'Professional Resume Builder',
        description: "Craft a standout, keyword-optimized resume using our intuitive builder. Let our AI enhance your descriptions to catch recruiters' attention and land more interviews.",
        icon: FileText,
        prototype: (
            <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-xl border border-border/50">
                <CardHeader className="p-0 mb-4 flex-row items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileText className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <CardTitle className="text-lg sm:text-xl m-0">Resume Builder</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div className="p-3 rounded-lg bg-muted border">
                        <p className="font-semibold text-sm">Diya Agarwal</p>
                        <p className="text-xs text-muted-foreground mt-1">Increased monthly sales 10% by effectively upselling...</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border opacity-70">
                        <p className="font-semibold text-sm">AI Suggestion</p>
                        <p className="text-xs text-muted-foreground mt-1">"Exceeded revenue targets by 10% through strategic upselling..."</p>
                    </div>
                </CardContent>
            </Card>
        )
    },
    {
        title: 'Automated Portfolio Website',
        description: 'Showcase your skills and completed challenges on a personal portfolio website. Connect your GitHub and let your activity on Talxify build your professional online presence automatically.',
        icon: User,
        prototype: (
             <Card className="w-full h-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-xl border border-border/50 flex flex-col justify-center">
                <CardHeader className="p-0 mb-4 flex-row items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <CardTitle className="text-lg sm:text-xl m-0">Portfolio Builder</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-muted border">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary">
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-base sm:text-lg">Jane Doe</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Full-Stack Developer</p>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border text-sm text-muted-foreground space-y-2">
                        <p className="font-semibold text-foreground text-base">Key Skills</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge>React</Badge>
                            <Badge>Next.js</Badge>
                            <Badge>Node.js</Badge>
                            <Badge variant="secondary">Python</Badge>
                        </div>
                    </div>
                     <div className="p-3 rounded-lg bg-muted border text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground text-base mb-2">Project Highlight</p>
                        <div className="p-2 rounded-md bg-background border">
                          <p className="font-bold text-sm text-foreground">E-commerce Platform</p>
                          <p className="text-xs">Built a full-stack e-commerce site with Stripe integration.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    },
];

const faqs = [
    {
        question: "How do institutional discounts work?",
        answer: "We provide special discount codes for your students, making our Pro plans more accessible. We can work with you to create a custom arrangement that best suits your students' needs. Please contact us to discuss the options."
    },
    {
        question: "Can Talxify integrate with our Learning Management System (LMS)?",
        answer: "Currently, we do not offer direct LMS integration. However, our platform is web-based and easily accessible to all students. Onboarding is a straightforward process, and we provide dedicated support to help your faculty and students get started quickly."
    },
    {
        question: "What kind of data and analytics can our institution access?",
        answer: "Institutions can be provided with an admin dashboard showing anonymized, aggregate data. This includes metrics on student activity, overall performance on quizzes by topic, and common areas of weakness, helping you gain valuable insights into your cohort's job-readiness."
    },
    {
        question: "How does the AI personalize the experience for each student?",
        answer: "Personalization is at our core. Students can generate interview questions for specific roles, create study notes for any topic, and practice with adaptive coding quizzes. The AI interviewer can also tailor questions based on the specified job role and level."
    },
    {
        question: "What kind of support do students receive?",
        answer: "All users have access to our support resources. Students on the Pro plan receive priority support to ensure any questions or issues are addressed promptly, allowing them to focus on their preparation."
    }
];

export default function InstituteColabPage() {
    return (
        <div className="bg-background min-h-screen text-foreground">
            <LandingHeader />

            {/* Hero Section */}
            <section className="relative bg-primary/5 pt-24 pb-20 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background/80 to-background opacity-70"></div>
                <div className="container mx-auto max-w-4xl px-4 md:px-6 relative py-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold mb-4 tracking-tighter">Bridge the Gap Between <br/> Academia and Industry</h1>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                        Partner with Talxify to provide your students with the cutting-edge AI tools they need to master technical interviews and launch successful careers in tech.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg">
                            <Link href="#contact">Partner With Us</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="#features">Learn More <ChevronDown className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </div>
                </div>
            </section>

             <main className="container mx-auto max-w-6xl p-4 md:p-6 lg:p-8 space-y-24">
                
                {/* Data-Driven Insights Section */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">Data-Driven Insights: Top 5 Student Stumbling Blocks</h2>
                        <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Based on thousands of AI-led interviews, we've identified the most common pitfalls for CS students. Here's how Talxify directly addresses them.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {failures.map((item, index) => (
                             <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-destructive/10 text-destructive p-3 rounded-full mt-1">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <CardTitle>{item.title}</CardTitle>
                                            <CardDescription>{item.problem}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-end">
                                     <div className="bg-muted/50 p-4 rounded-lg mt-4">
                                        <p className="font-semibold text-foreground mb-2 flex items-center gap-2"><UserCheck className="w-5 h-5 text-yellow-500"/> Interview Impact</p>
                                        <p className="text-sm text-muted-foreground">{item.interviewImpact}</p>
                                    </div>
                                     <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg mt-4">
                                        <p className="font-semibold text-primary mb-2 flex items-center gap-2"><Bot className="w-5 h-5"/> The Talxify Solution</p>
                                        <p className="text-sm text-muted-foreground">{item.solution}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section id="features">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">How Talxify Can Help</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">We provide a suite of powerful AI tools designed to build skills, confidence, and job-readiness.</p>
                    </div>
                     <div className="space-y-16 sm:space-y-24">
                        {features.map((feature, index) => (
                            <div key={feature.title} className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
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
                </section>

                {/* Calendly Embed Section */}
                <section id="schedule-call">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">Connect With Us</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Schedule a 30-minute call with our partnership team to get started.</p>
                    </div>
                    <Card className="max-w-4xl mx-auto shadow-lg overflow-hidden">
                        <CardContent className="p-0 h-[650px]">
                           <CalEmbed />
                        </CardContent>
                    </Card>
                </section>

                {/* FAQ Section */}
                <section id="faq">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Answers to common questions from colleges and universities.</p>
                    </div>
                     <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </section>

                 {/* Contact/CTA Section */}
                <section id="contact" className="py-16">
                    <div className="relative rounded-2xl p-8 md:p-12 text-center overflow-hidden bg-gradient-to-br from-primary/90 to-blue-500/90 text-primary-foreground shadow-2xl shadow-primary/20">
                        <div className="absolute inset-0 bg-dot-pattern opacity-20"></div>
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold font-headline mb-4">Ready to Empower Your Students?</h2>
                            <p className="max-w-2xl mx-auto text-lg text-primary-foreground/80 mb-8">
                                Let's discuss how Talxify can be tailored to your institution's needs. Contact us today for a personalized demo and a custom pricing plan.
                            </p>
                            <Button size="lg" variant="secondary" asChild className="text-base">
                                <a href="mailto:partners@talxify.space">
                                    Request a Demo <ArrowRight className="ml-2 h-4 w-4"/>
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
