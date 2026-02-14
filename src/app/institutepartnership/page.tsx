
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        title: "01. Analytical Communication Deficit",
        problem: "Candidates often possess theoretical proficiency but lack the ability to articulate complex logic under high-pressure evaluative conditions.",
        interviewImpact: "In live assessments, this manifests as cognitive freezing. Students struggle to externalize their thought process, leading to a perceived lack of competency regardless of actual technical skill.",
        solution: "Our Voice AI creates a high-fidelity simulation of industry interviews, allowing students to normalize the pressure and develop the cognitive 'muscle memory' required for clear technical articulation."
    },
    {
        title: "02. Complexity Awareness & Optimization",
        problem: "A significant percentage of students default to sub-optimal algorithmic solutions (O(n²)) without considering computational efficiency or space complexity.",
        interviewImpact: "Proposing brute-force solutions without an optimization roadmap is a critical disqualifier for top-tier firms. It signals a lack of foundational engineering rigor.",
        solution: "The Talxify analysis engine evaluates time and space complexity in real-time. It doesn't just validate output; it mentors students on refactoring toward peak performance."
    },
    {
        title: "03. Code Scalability & Industry Standards",
        problem: "Academic coding often overlooks readability, modularity, and naming conventions essential for collaborative professional environments.",
        interviewImpact: "Interviewers view poorly structured code as a liability for team maintenance. It demonstrates a lack of exposure to the 'Clean Code' principles expected in the industry.",
        solution: "Our platform enforces professional linting standards and architectural best practices, providing students with direct feedback on how to write production-ready code."
    },
    {
        title: "04. Soft Skill Structural Alignment",
        problem: "Behavioral prompts often receive unstructured, anecdotal responses that fail to highlight leadership or conflict resolution effectively.",
        interviewImpact: "This prevents students from demonstrating their cultural fit. Missing the opportunity to use structured frameworks like the STAR method often leads to lower evaluation scores.",
        solution: "Talxify's behavioral AI clones are trained on thousands of data points to probe for specific soft skills, guiding students to frame their experiences within proven professional frameworks."
    },
    {
        title: "05. Problem Parsing & Constraint Logic",
        problem: "The tendency to begin implementation before fully digesting problem constraints leads to architectural errors and wasted resources.",
        interviewImpact: "In an industry setting, this is a costly inefficiency. In an interview, it demonstrates a lack of analytical maturity and poor cross-functional communication.",
        solution: "Our simulated prompts mimic real-world specifications, requiring students to validate inputs and understand edge cases before the code execution phase is validated."
    },
]


const features = [
    {
        title: 'Human-Like AI Interviews',
        description: "Experience a realistic, voice-based mock interview. Our conversational AI asks relevant technical and behavioral questions, listens to your answers, and responds dynamically, just like a real interviewer.",
        icon: MessageSquare,
        prototype: (
            <div className="w-full max-w-lg mx-auto aspect-video rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl border border-border/50 bg-background relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 thermal-gradient-bg z-0" />
                <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className={cn("relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full transition-all duration-500 scale-100")}>
                        <div className={cn("absolute inset-0 rounded-full bg-primary/10 animate-pulse duration-1000")} />
                        <div className={cn("absolute inset-2 rounded-full bg-primary/20 animate-pulse duration-1500")} />
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
                    <Video className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <div className="absolute bottom-2 left-1/2 sm:bottom-4 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-background/50 border p-1 sm:p-2 backdrop-blur-md">
                    <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" variant={'secondary'}><Mic className="w-4 h-4 sm:w-auto" /></Button>
                    <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" variant={'secondary'}><Video className="w-4 h-4 sm:w-auto" /></Button>
                    <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" variant={'destructive'}><Phone className="w-4 h-4 sm:w-auto" /></Button>
                </div>
                <div className="absolute top-1 left-1/2 sm:top-2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-2 bg-background/50 border rounded-full px-3 py-1 text-[10px] sm:text-xs text-muted-foreground backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
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
                        <span className="text-primary">function</span> <span className="text-foreground">reverseString</span>(<span className="text-yellow-400">str</span>) {"{"} <br />
                        &nbsp;&nbsp;<span className="text-gray-500">// Your code here...</span><br />
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
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-lg"><BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6" /></div>
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
                        <div className="w-1/4 h-1/2 bg-primary/30 rounded-t-sm animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1/4 h-3/4 bg-primary/50 rounded-t-sm animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1/4 h-2/3 bg-primary/40 rounded-t-sm animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-1/4 h-full bg-primary/60 rounded-t-sm animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
            <section className="relative pt-32 pb-20 sm:pt-40 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-0 right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 md:px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge variant="outline" className="mb-6 px-4 py-1 border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">
                            Institutional Excellence
                        </Badge>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 leading-[0.9] text-foreground">
                            Bridging the <br /> <span className="text-primary">University-to-Industry</span> Gap.
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg sm:text-xl font-medium italic text-muted-foreground leading-relaxed mb-10">
                            Equip your students with the elite AI tools required to master technical placements and land top-tier offers from global technology leaders.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-primary hover:scale-105 transition-all font-black uppercase tracking-widest italic text-base shadow-2xl shadow-primary/30">
                                <a href="#schedule-call">Partner With Us</a>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 font-black uppercase tracking-widest italic text-base">
                                <a href="#features">Explore suite <ChevronDown className="ml-2 h-4 w-4" /></a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <main className="container mx-auto max-w-6xl p-4 md:p-6 lg:p-8 space-y-24">

                {/* Data-Driven Insights Section */}
                <section>
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
                        >
                            <BrainCircuit size={14} className="fill-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Vocational Analytics</span>
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 text-foreground">Academic <span className="text-primary">Insights.</span></h2>
                        <p className="text-muted-foreground mt-2 max-w-3xl mx-auto italic font-medium">Based on thousands of data points from AI-led assessments, we've identified the critical skill deficits in graduating cohorts.</p>
                        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto text-left mt-12 bg-muted/20 dark:bg-white/[0.02] border border-border/50 rounded-[3rem] p-10 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                                <FileText size={180} className="text-primary" />
                            </div>
                            <div className="relative z-10 space-y-6 text-foreground/80 italic font-medium">
                                <p>
                                    The transition from academic theory to professional engineering is a significant hurdle. Our data shows that while students excel in foundational Computer Science, a staggering <strong>70% struggle with technical articulation</strong>—the ability to explain their mental models under pressure. This is a critical barrier to high-tier placement.
                                </p>
                                <p>
                                    Furthermore, over <strong>60% of initial coding assessments</strong> result in failure not due to a lack of logic, but a failure to account for industry-standard constraints and efficiency metrics. In an era where recruiters prioritize scalability over simple output, these deficits are costly. Talxify serves as the missing link, providing your institution with the technological suite to convert theoretical knowledge into industry-ready competency.
                                </p>
                                <div className="pt-4 border-t border-border/20 flex flex-wrap gap-6 text-xs items-center">
                                    <span className="text-muted-foreground font-black uppercase tracking-widest leading-none">External Research:</span>
                                    <a href="https://www.forbes.com/sites/forbestechcouncil/2023/03/27/the-tech-skills-gap-is-widening-how-can-businesses-bridge-it/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">Forbes: The Tech Skills Gap <ArrowRight size={10} /></a>
                                    <a href="https://timesofindia.indiatimes.com/blogs/voices/the-great-indian-employability-crisis-bridging-the-gap-between-education-and-industry/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">TOI: The Employability Crisis <ArrowRight size={10} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                        {failures.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full rounded-[2.5rem] border border-border/50 dark:border-white/10 bg-card/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden group">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 bg-red-500/10 text-red-500 p-3 rounded-2xl mt-1 border border-red-500/20 group-hover:scale-110 transition-transform">
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-foreground leading-none mb-1">{item.title}</CardTitle>
                                                <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 italic">{item.problem}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 space-y-4">
                                        <div className="bg-muted/30 dark:bg-white/[0.02] p-6 rounded-[1.8rem] border border-border/20">
                                            <p className="text-[10px] font-black italic uppercase tracking-widest text-foreground/40 mb-2 flex items-center gap-2">Impact on Placement</p>
                                            <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">{item.interviewImpact}</p>
                                        </div>
                                        <div className="bg-primary/5 border border-primary/20 p-6 rounded-[1.8rem] relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black italic uppercase tracking-widest text-primary mb-2 flex items-center gap-2">The Talxify Intervention</p>
                                                <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">{item.solution}</p>
                                            </div>
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                                <Bot size={80} className="text-primary" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section id="features">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
                        >
                            <ListChecks size={14} className="fill-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Engineering Suite</span>
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 text-foreground">The University <span className="text-primary">Ecosystem.</span></h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto font-medium italic">Advanced AI protocols designed to elevate student career readiness and placement success.</p>
                    </div>
                    <div className="space-y-32 sm:space-y-48">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center"
                            >
                                <div className={cn("space-y-6", index % 2 === 1 && "lg:order-2")}>
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-primary/10 text-primary p-4 rounded-2xl w-fit border border-primary/20">
                                            <feature.icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-black italic uppercase tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-none text-foreground">{feature.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-lg italic leading-relaxed font-medium">{feature.description}</p>
                                    <div className="pt-4">
                                        <Button variant="ghost" className="p-0 text-primary hover:text-primary/80 font-black uppercase tracking-widest italic group">
                                            Learn Implementation Protocol <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                                <div className={cn("flex items-center justify-center", index % 2 === 1 && "lg:order-1")}>
                                    <div className="bg-muted/20 dark:bg-white/[0.02] rounded-[3rem] border border-border/50 p-2 sm:p-4 shadow-2xl w-full relative group transition-transform duration-700 hover:scale-[1.02]">
                                        <div className="absolute inset-0 bg-primary/5 rounded-[3rem] blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
                                        {feature.prototype}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Calendly Embed Section */}
                <section id="schedule-call">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
                        >
                            <CalendarDays size={14} className="fill-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Consultation</span>
                        </motion.div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-6 text-foreground">Schedule a <span className="text-primary">Strategic Demo.</span></h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto font-medium italic">Coordinate a session with our engineering team to explore institutional integration opportunities.</p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="max-w-5xl mx-auto shadow-[0_0_50px_rgba(var(--primary),0.1)] overflow-hidden rounded-[3rem] border border-border/50 bg-card/40 backdrop-blur-xl">
                            <CardContent className="p-0 h-[700px]">
                                <CalEmbed />
                            </CardContent>
                        </Card>
                    </motion.div>
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
                <section id="contact" className="py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-[4rem] p-12 md:p-20 text-center overflow-hidden border border-primary/20 bg-primary/[0.02] dark:bg-black/40 backdrop-blur-3xl shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[150px]" />
                            <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[150px]" />
                        </div>

                        <div className="relative z-10 max-w-4xl mx-auto">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic mb-8">
                                Institutional Integration
                            </span>
                            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 leading-[0.85] text-foreground">
                                Empower Your <br /><span className="text-primary">Graduating Cohort.</span>
                            </h2>
                            <p className="max-w-2xl mx-auto text-lg sm:text-xl font-medium italic text-muted-foreground/80 mb-12 leading-relaxed">
                                Let's discuss how Talxify can be tailored to your institution's specific pedagogical needs. Contact us today for a strategic implementation roadmap.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-6">
                                <Button size="lg" asChild className="h-16 px-12 rounded-2xl bg-primary hover:scale-105 transition-all font-black uppercase tracking-widest italic text-base shadow-2xl shadow-primary/30">
                                    <a href="#schedule-call">
                                        Request Strategic Demo <ArrowRight className="ml-2 h-5 w-5" />
                                    </a>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="h-16 px-12 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 font-black uppercase tracking-widest italic text-base">
                                    <Link href="/about">
                                        View University Portfolio
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
