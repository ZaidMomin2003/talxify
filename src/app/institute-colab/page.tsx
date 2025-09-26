
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature) => (
                            <Card key={feature.title} className="bg-card/50 border-border/50 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
                                <CardHeader className="flex-row gap-4 items-center">
                                    <div className="bg-primary/10 text-primary rounded-lg p-3">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="m-0 text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </CardContent>
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

    
