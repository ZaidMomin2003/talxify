
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Github, Linkedin, Instagram, Mail, Phone, Link as LinkIcon, Award, Briefcase, MessageSquare, GraduationCap, Sparkles, Building, Calendar, Star, Code, Twitter, Globe, School, Percent, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getPortfolio } from "@/lib/firebase-service";
import type { Portfolio } from "@/lib/types";
import { initialPortfolioData } from "@/lib/initial-data";

const Section = ({ icon, title, children, className }: { icon: React.ReactNode, title: string, children: React.ReactNode, className?: string }) => (
    <section className={cn("space-y-6", className)}>
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-2">
                {icon}
            </div>
            <h2 className="text-3xl font-bold">{title}</h2>
        </div>
        {children}
    </section>
);

function PortfolioComponent() {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const themeColor = searchParams.get('color') || '221.2 83.2% 53.3%';

    const fetchPortfolio = useCallback(async () => {
        if (!user) {
            // Use initial data for non-logged in view or preview
            setPortfolio(initialPortfolioData.portfolio);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const data = await getPortfolio(user.uid);
        setPortfolio(data ?? initialPortfolioData.portfolio);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    if (isLoading || !portfolio) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div 
            className="bg-background min-h-screen"
            style={{ '--primary': portfolio.themeColor } as React.CSSProperties}
        >
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-4xl">
                    <Link href="#" className="flex items-center gap-2">
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" alt={portfolio.personalInfo.name} data-ai-hint="person avatar" />
                            <AvatarFallback>{portfolio.personalInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xl font-bold">{portfolio.personalInfo.name}</span>
                    </Link>
                    <Button asChild>
                        <a href={`mailto:${portfolio.personalInfo.email}`}>Contact Me</a>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-16 max-w-4xl">
                {/* Hero Section */}
                <section className="relative -mt-16 -mx-8">
                     <Image src={portfolio.personalInfo.bannerUrl || 'https://placehold.co/1200x300.png'} alt="Portfolio Banner" width={1200} height={300} className="w-full h-48 md:h-64 object-cover" data-ai-hint="abstract banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <div className="relative container max-w-4xl mx-auto p-4 md:p-6 lg:p-8 text-center -mt-24">
                        <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary shadow-lg">
                            <AvatarImage src="https://placehold.co/128x128.png" alt={portfolio.personalInfo.name} data-ai-hint="person avatar" />
                            <AvatarFallback>{portfolio.personalInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-5xl font-headline font-bold mb-2">{portfolio.personalInfo.name}</h1>
                        <p className="text-2xl text-primary font-semibold mb-4">{portfolio.personalInfo.profession}</p>
                        <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-6">{portfolio.personalInfo.bio}</p>
                        <div className="flex justify-center flex-wrap gap-4 mb-8">
                            <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.github} target="_blank" rel="noopener noreferrer"><Github /></a></Button>
                            <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin /></a></Button>
                            <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.twitter} target="_blank" rel="noopener noreferrer"><Twitter /></a></Button>
                            <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram /></a></Button>
                            <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.website} target="_blank" rel="noopener noreferrer"><Globe /></a></Button>
                        </div>
                        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2">
                            <a href={`mailto:${portfolio.personalInfo.email}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" />{portfolio.personalInfo.email}</a>
                            {portfolio.personalInfo.phone && <div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" />{portfolio.personalInfo.phone}</div>}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">+2 since last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Coding Questions Solved</CardTitle>
                            <Code className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">57</div>
                            <p className="text-xs text-muted-foreground">+10 since last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Job Likelihood</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">78%</div>
                            <p className="text-xs text-muted-foreground">Based on your performance</p>
                        </CardContent>
                    </Card>
                </section>
                
                 {/* Skills Section */}
                <Section icon={<Code />} title="Skills">
                    <Card className="p-6">
                        <div className="flex flex-wrap gap-3">
                            {portfolio.skills.map((skill) => (
                                <Badge key={skill.skill} variant="secondary" className="text-base px-4 py-2">{skill.skill}</Badge>
                            ))}
                        </div>
                    </Card>
                </Section>
                
                {/* Work Experience Section */}
                <Section icon={<Briefcase />} title="Work Experience">
                    <div className="space-y-8 relative before:absolute before:inset-y-0 before:w-px before:bg-border before:left-6">
                        {portfolio.experience.map((exp, index) => (
                            <div key={index} className="relative pl-12">
                                <div className="absolute left-6 -translate-x-1/2 top-1 w-3 h-3 rounded-full bg-primary" />
                                <p className="font-semibold text-lg">{exp.role}</p>
                                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-muted-foreground">
                                    <p className="inline-flex items-center gap-2"><Building className="w-3.5 h-3.5" /> {exp.company}</p>
                                    <p className="inline-flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {exp.duration}</p>
                                </div>
                                <p className="mt-2 text-muted-foreground">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </Section>
                
                {/* Education Section */}
                 <Section icon={<School />} title="Education">
                    <div className="space-y-4">
                        {portfolio.education.map((edu, index) => (
                            <Card key={index} className="p-4 flex items-center gap-4">
                                <div className="bg-muted text-muted-foreground rounded-full p-3">
                                    <School className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">{edu.degree}</p>
                                    <p className="text-muted-foreground">{edu.institution} - {edu.year}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Section>

                {/* Projects Section */}
                <Section icon={<Sparkles />} title="Projects">
                    <div className="space-y-8">
                        {portfolio.projects.map((project, index) => (
                            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {project.title}
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                            <LinkIcon className="w-5 h-5" />
                                        </a>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-4">{project.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.split(',').map(tag => tag.trim() && <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </Section>

                {/* Certificates Section */}
                <Section icon={<GraduationCap />} title="Certificates">
                    <div className="space-y-4">
                        {portfolio.certificates.map((cert, index) => (
                            <Card key={index} className="p-4 flex items-center gap-4">
                                <div className="bg-muted text-muted-foreground rounded-full p-2">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">{cert.name}</p>
                                    <p className="text-sm text-muted-foreground">{cert.body} - {cert.date}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Section>
                
                {/* Achievements Section */}
                <Section icon={<Award />} title="Achievements">
                    <Card className="p-6">
                        <ul className="space-y-3 list-inside">
                            {portfolio.achievements.map((ach, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Star className="w-4 h-4 text-primary mt-1 shrink-0" />
                                    <span className="text-muted-foreground">{ach.description}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Section>

                {/* Testimonials Section */}
                <Section icon={<MessageSquare />} title="Testimonials">
                    <div className="space-y-6">
                        {portfolio.testimonials.map((test, index) => (
                             <blockquote key={index} className="p-6 bg-muted/50 rounded-lg border-l-4 border-primary">
                                <p className="italic text-lg">"{test.testimonial}"</p>
                                <footer className="mt-4 text-right font-semibold"> - {test.author}</footer>
                            </blockquote>
                        ))}
                    </div>
                </Section>

                {/* FAQs Section */}
                <Section icon={<Sparkles />} title="FAQs">
                    <Accordion type="single" collapsible className="w-full">
                        {portfolio.faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Section>
            </main>

            <footer className="text-center p-6 border-t mt-16">
                <p className="text-muted-foreground">© {new Date().getFullYear()} {portfolio.personalInfo.name}. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default function PortfolioPreviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <PortfolioComponent />
        </Suspense>
    )
}
