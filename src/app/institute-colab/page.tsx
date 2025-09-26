
'use client';

import React from 'react';
import LandingHeader from '../landing-header';
import LandingFooter from '../landing-footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, BookOpen, Bot, Briefcase, CheckCircle, ChevronDown, Code, FileText, Globe, GraduationCap, Users, Swords, ShieldQuestion, ListChecks, CalendarDays, MessageSquare, Sparkles, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const benefits = [
    {
        icon: GraduationCap,
        title: 'Boost Employability',
        description: "Equip your students with the practical interview skills and confidence needed to convert their academic knowledge into job offers."
    },
    {
        icon: BarChart,
        title: 'Gain Curriculum Insights',
        description: "Use our analytics dashboard to identify common skill gaps and areas where students struggle, providing valuable data to refine your curriculum."
    },
    {
        icon: Briefcase,
        title: 'Strengthen Industry Ties',
        description: "Demonstrate a solid commitment to industry-readiness, enhancing your institution's reputation among top tech employers."
    }
]

const features = [
    {
        title: 'Your Personalized 60-Day Prep Plan',
        description: 'Start with a plan tailored to your target roles and companies. Our AI generates a comprehensive, 60-day syllabus covering everything from data structures to system design, ensuring students learn what matters most.',
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
        description: "Don't just memorize—understand. Select any topic from the syllabus, and our AI will generate a detailed, easy-to-digest study guide, complete with core concepts, key terminology, and practical code examples.",
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
        title: 'Interactive Coding Quizzes (Code Izanami)',
        description: 'Test knowledge with AI-generated coding challenges. Write solutions in our editor and get instant, in-depth feedback on correctness, efficiency, and code style, along with an optimal solution.',
        icon: ShieldQuestion,
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
             <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-4 shadow-xl border border-border/50">
                <div className="aspect-video bg-muted rounded-lg relative flex items-center justify-center border">
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                         <Users className="w-24 h-24 text-white/20" />
                    </div>
                    <div className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white text-xs flex items-center gap-1.5"><Users className="w-3 h-3"/> You</div>
                    
                    <div className="absolute bottom-4 left-4 w-1/3 aspect-[4/3] bg-black/50 border border-primary/50 rounded-lg flex flex-col items-center justify-center p-2 backdrop-blur-sm">
                        <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                        <div className="text-white text-xs mt-1">AI Interviewer</div>
                    </div>

                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <Button size="icon" variant="secondary" className="rounded-full h-10 w-10"><span className="text-xl">🎤</span></Button>
                        <Button size="icon" variant="secondary" className="rounded-full h-10 w-10"><span className="text-xl">📹</span></Button>
                        <Button size="icon" variant="destructive" className="rounded-full h-10 w-10"><span className="text-xl">📞</span></Button>
                    </div>
                </div>
            </Card>
        )
    },
    {
        title: 'In-Depth Performance Analytics',
        description: 'Track progress with a comprehensive dashboard. Analyze quiz scores, identify weak concepts, and review interview transcripts to pinpoint areas for improvement.',
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
        answer: "Personalization is at our core. The journey begins with a custom 60-day prep syllabus based on the student's target roles and companies. The 'Code Izanami' quizzes adapt in difficulty based on performance, and the AI interviewer can tailor questions based on the specified job role and level."
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

                {/* Benefits Section */}
                <section>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {benefits.map(benefit => (
                            <div key={benefit.title} className="flex flex-col items-center">
                                <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                                    <benefit.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                                <p className="text-muted-foreground">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* Video Section */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">See Talxify in Action</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">A quick overview of the platform and how it empowers students.</p>
                    </div>
                    <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border">
                         <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/Tn6-PIqc4UM"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </section>
                
                 {/* Features Section */}
                <section id="features">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">The Ultimate Student Toolkit</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">A suite of powerful AI features designed to build skills, confidence, and job-readiness.</p>
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
                                a>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}

// Add this to your globals.css or a relevant CSS file
const dotPatternStyle = `
    .bg-dot-pattern {
        background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
        background-size: 1.5rem 1.5rem;
    }
`;
// You can either inject this style or add it to your CSS file. 
// For this example, I'll assume it's added to globals.css.
// In a real scenario, you'd add this class to your tailwind config or a css file.
// For now, let's just make a note it's needed. I'll add a comment in the code to reflect this.

    

    