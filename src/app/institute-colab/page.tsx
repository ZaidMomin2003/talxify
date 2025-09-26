
'use client';

import React from 'react';
import LandingHeader from '../landing-header';
import LandingFooter from '../landing-footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, BookOpen, Bot, Briefcase, CheckCircle, ChevronDown, Code, FileText, Globe, GraduationCap, Users, Swords, ShieldQuestion, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

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
        title: 'AI Mock Interviews',
        description: 'Students practice with a human-like AI that asks relevant technical and behavioral questions, providing instant feedback on answers, clarity, and confidence.',
        icon: Bot,
    },
    {
        title: '60-Day Prep Arena',
        description: 'A personalized, day-by-day syllabus that guides students through crucial topics, ensuring structured and comprehensive preparation.',
        icon: Swords,
    },
    {
        title: 'Code Izanami',
        description: 'Adaptive coding quizzes that get harder as students succeed, with instant AI analysis of their solutions for correctness, style, and efficiency.',
        icon: ShieldQuestion,
    },
    {
        title: 'AI-Generated Study Notes',
        description: 'Students can generate in-depth study guides on any technical topic, complete with core concepts, code examples, and interview questions.',
        icon: BookOpen,
    },
    {
        title: 'Professional Resume Builder',
        description: 'An intuitive tool, powered by AI enhancement, to help students craft professional resumes that stand out to recruiters.',
        icon: FileText,
    },
    {
        title: 'Dynamic Portfolio Builder',
        description: 'A personal portfolio page that automatically showcases completed challenges, quiz scores, and projects to impress employers.',
        icon: Users,
    },
    {
        title: 'Detailed Performance Analytics',
        description: 'Visual dashboards that help students track their progress, identify weak concepts, and focus their study efforts effectively.',
        icon: BarChart,
    },
    {
        title: 'Prep To-Do List',
        description: 'A simple, integrated to-do list to help students stay organized, manage their tasks, and remain on track with their preparation goals.',
        icon: ListChecks,
    },
];


const faqs = [
    {
        question: "How does institutional pricing work?",
        answer: "We offer flexible and affordable bulk licensing plans based on the number of student seats you require. Pricing is significantly discounted compared to individual plans. Please contact us for a custom quote."
    },
    {
        question: "Can we integrate Talxify with our Learning Management System (LMS)?",
        answer: "While we don't offer direct LMS integration at this moment, we provide simple onboarding for students and dedicated support for faculty to make the process as smooth as possible. We are exploring integrations for future releases."
    },
    {
        question: "What kind of data and analytics can we access?",
        answer: "Institutions get access to an admin dashboard with anonymized, aggregate data on student activity, quiz performance by topic, common areas of weakness, and overall progress through the prep syllabus."
    },
    {
        question: "How do you protect student privacy?",
        answer: "Student privacy is our top priority. All performance data is handled securely. The institutional dashboard only shows aggregated and anonymized data to ensure individual student privacy is maintained."
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

            <main className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-8 space-y-24">

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
                
                {/* Features Section */}
                <section id="features">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold font-headline">The Ultimate Student Toolkit</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">A suite of powerful AI features designed to build skills, confidence, and job-readiness.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature) => (
                            <Card key={feature.title} className="p-6 flex items-start gap-6 hover:border-primary/50 hover:bg-card/80 transition-all">
                                <div className="bg-primary/10 text-primary rounded-lg p-3 mt-1">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </div>
                            </Card>
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
                     <Card className="bg-primary/10 border-primary/20 text-center p-8 md:p-12">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold font-headline">Ready to Empower Your Students?</CardTitle>
                            <CardDescription className="max-w-xl mx-auto text-lg">
                               Let's discuss how Talxify can be tailored to your institution's needs. Contact us today for a personalized demo and a custom pricing plan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button size="lg" asChild>
                                <a href="mailto:partners@talxify.space">
                                    Request a Demo
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
