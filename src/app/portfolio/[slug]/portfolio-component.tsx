
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Github, Linkedin, Instagram, Mail, Phone, Link as LinkIcon, Award, Briefcase, MessageSquare, GraduationCap, Sparkles, Building, Calendar, Star, Code, Twitter, Globe, School, Percent, Loader2, Bot, User as UserIcon, BarChart, Youtube, HelpCircle, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import type { UserData, QuizResult } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";


const Section = ({ icon, title, children, className, id }: { icon: React.ReactNode, title: string, children: React.ReactNode, className?: string, id: string }) => (
    <section id={id} className={cn("py-12 scroll-mt-24", className)}>
        <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 text-primary rounded-lg p-3">
                {icon}
            </div>
            <h2 className="text-3xl font-bold font-headline">{title}</h2>
        </div>
        {children}
    </section>
);

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
        <p className="label font-bold text-foreground">{`${label}`}</p>
        <div style={{ color: "hsl(var(--primary))" }} className="flex items-center gap-2 font-semibold">
          Proficiency: {payload[0].value}%
        </div>
      </div>
    );
  }
  return null;
}

const navLinks = [
    { href: "#about", label: "About" },
    { href: "#stats", label: "Stats" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Projects" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#faqs", label: "FAQs" },
];

function PortfolioHeader({ name, email, imageUrl }: { name: string, email: string, imageUrl?: string }) {
    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                         <Avatar className="w-10 h-10 border-2 border-primary">
                            <AvatarImage src={imageUrl} alt={name} data-ai-hint="person avatar" />
                            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-lg">{name}</span>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Button key={link.href} variant="ghost" asChild>
                                <a href={link.href}>{link.label}</a>
                            </Button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <a href={`mailto:${email}`}>Contact Me</a>
                        </Button>
                        <div className="md:hidden">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {navLinks.map(link => (
                                         <DropdownMenuItem key={link.href} asChild>
                                            <a href={link.href}>{link.label}</a>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function PortfolioLoadingSkeleton() {
    return (
      <div className="bg-background min-h-screen animate-pulse">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-md" />)}
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </header>
        {/* Main content skeleton */}
        <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start mb-8 lg:mb-0">
              <Card className="p-6 text-center shadow-lg">
                <Skeleton className="w-32 h-32 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-8 w-3/4 mx-auto mb-2 rounded-md" />
                <Skeleton className="h-6 w-1/2 mx-auto mb-6 rounded-md" />
                <div className="flex justify-center flex-wrap gap-2 mb-6">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-10 h-10 rounded-md" />)}
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </Card>
              <Card className="p-6 mt-8 shadow-lg">
                <Skeleton className="h-6 w-1/3 mb-4 rounded-md" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
                </div>
              </Card>
            </aside>
            <main className="lg:col-span-8 space-y-12">
              <Skeleton className="w-full h-48 md:h-64 rounded-xl" />
              <div>
                <Skeleton className="h-10 w-48 mb-8 rounded-md" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
              <div>
                <Skeleton className="h-10 w-48 mb-8 rounded-md" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
}


export default function PortfolioComponent({ userData }: { userData: UserData | null }) {
    const portfolio = userData?.portfolio;

    const { questionsSolved, interviewsCompleted, averageScore } = useMemo(() => {
        if (!userData?.activity) {
            return { questionsSolved: 0, interviewsCompleted: 0, averageScore: 0 };
        }
        const quizzes = userData.activity.filter(item => item.type === 'quiz') as QuizResult[];
        const interviews = userData.activity.filter(item => item.type === 'interview');
        const completedQuizzes = quizzes.filter(item => item.analysis.length > 0);
    
        const solved = completedQuizzes.reduce((acc, quiz) => acc + quiz.quizState.length, 0);
    
        const totalScore = completedQuizzes.reduce((sum, quiz) => {
            const quizScore = quiz.analysis.reduce((s, a) => s + a.score, 0);
            return sum + (quizScore / Math.max(quiz.analysis.length, 1));
        }, 0);
        
        const avgScore = completedQuizzes.length > 0 ? Math.round((totalScore / completedQuizzes.length) * 100) : 0;
    
        return {
            questionsSolved: solved,
            interviewsCompleted: interviews.length,
            averageScore: avgScore,
        };
      }, [userData?.activity]);
    
    const getYouTubeEmbedUrl = (url: string | undefined) => {
        if (!url) return null;
        let videoId;
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        } else {
            return null;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    };

    if (!userData) {
        return <PortfolioLoadingSkeleton />;
    }
    
    if (!portfolio) {
        return (
            <div className="flex h-screen items-center justify-center">
                 <Card className="text-center p-8">
                    <CardTitle>Portfolio Not Found</CardTitle>
                    <CardDescription>We couldn't find a portfolio with that slug.</CardDescription>
                </Card>
            </div>
        );
    }
    
    const youtubeEmbedUrl = getYouTubeEmbedUrl(portfolio?.personalInfo.youtubeVideoUrl);
    
    return (
        <div 
            className="bg-background min-h-screen"
            style={{ '--primary': portfolio.themeColor } as React.CSSProperties}
        >
            <PortfolioHeader name={portfolio.personalInfo.name} email={portfolio.personalInfo.email} imageUrl={portfolio.personalInfo.avatarUrl} />
            <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                    {/* Sticky Sidebar */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start mb-8 lg:mb-0">
                        <Card className="p-6 text-center shadow-lg">
                            <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary shadow-lg">
                                <AvatarImage src={portfolio.personalInfo.avatarUrl} alt={portfolio.personalInfo.name} data-ai-hint="person avatar" />
                                <AvatarFallback>{portfolio.personalInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <h1 className="text-3xl font-headline font-bold mb-1">{portfolio.personalInfo.name}</h1>
                            <p className="text-lg text-primary font-semibold mb-6">{portfolio.personalInfo.profession}</p>
                            
                             <div className="flex justify-center flex-wrap gap-2 mb-6">
                                <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.github} target="_blank" rel="noopener noreferrer"><Github /></a></Button>
                                <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin /></a></Button>
                                <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.twitter} target="_blank" rel="noopener noreferrer"><Twitter /></a></Button>
                                <Button variant="ghost" size="icon" asChild><a href={portfolio.socials.website} target="_blank" rel="noopener noreferrer"><Globe /></a></Button>
                            </div>
                            
                            <Button asChild className="w-full">
                                <a href={`mailto:${portfolio.personalInfo.email}`}>
                                    <Mail className="mr-2 h-4 w-4" /> Contact Me
                                </a>
                            </Button>
                        </Card>
                        <Card className="p-6 mt-8 shadow-lg">
                           <CardTitle className="mb-4 text-xl">Skills</CardTitle>
                           <CardContent className="p-0">
                                <div className="flex flex-wrap gap-2">
                                    {portfolio.skills.map((skill) => (
                                        <Badge key={skill.skill} variant="secondary" className="text-base px-3 py-1">{skill.skill}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-8">
                         <Image src={portfolio.personalInfo.bannerUrl || 'https://placehold.co/1200x300.png'} alt="Portfolio Banner" width={1200} height={300} className="w-full h-48 md:h-64 object-cover rounded-xl shadow-lg" data-ai-hint="abstract banner" />

                        <Section id="about" icon={<UserIcon />} title="About Me">
                            <p className="text-lg text-muted-foreground leading-relaxed">{portfolio.personalInfo.bio}</p>
                        </Section>
                        
                        {youtubeEmbedUrl && (
                            <Section id="video-intro" icon={<Youtube />} title="Video Introduction">
                                <Card className="overflow-hidden">
                                    <div className="aspect-video">
                                        <iframe
                                            className="w-full h-full"
                                            src={youtubeEmbedUrl}
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </Card>
                            </Section>
                        )}


                        <Section id="stats" icon={<Percent />} title="Activity Stats">
                             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{interviewsCompleted}</div>
                                        <p className="text-xs text-muted-foreground">Practice makes perfect</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Coding Questions Solved</CardTitle>
                                        <Code className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{questionsSolved}</div>
                                        <p className="text-xs text-muted-foreground">Across all quizzes</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                        <Percent className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{averageScore}%</div>
                                        <p className="text-xs text-muted-foreground">Based on your performance</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </Section>
                        
                         <Section id="skill-proficiency" icon={<BarChart />} title="Skill Proficiency">
                            <Card>
                                <CardContent className="pt-6 h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={portfolio.skills}
                                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorExpertise" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                            <Area type="monotone" dataKey="expertise" name="Proficiency" stroke="hsl(var(--primary))" fill="url(#colorExpertise)" strokeWidth={2} activeDot={{ r: 6, style: { fill: 'hsl(var(--primary))' } }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Section>

                        <Section id="experience" icon={<Briefcase />} title="Work Experience">
                            <div className="space-y-8 relative before:absolute before:inset-y-0 before:w-px before:bg-border before:left-6">
                                {portfolio.experience.map((exp, index) => (
                                    <div key={index} className="relative pl-12">
                                        <div className="absolute left-6 -translate-x-1/2 top-1 w-3 h-3 rounded-full bg-primary" />
                                        <p className="font-semibold text-lg">{exp.role}</p>
                                        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-muted-foreground">
                                            <p className="inline-flex items-center gap-2"><Building className="w-3.5 h-3.5" /> {exp.company}</p>
                                            <p className="inline-flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {exp.duration}</p>
                                        </div>
                                        <p className="mt-2 text-muted-foreground" dangerouslySetInnerHTML={{ __html: exp.description.replace(/\n/g, '<br />') }}></p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                        
                        <Section id="education" icon={<School />} title="Education">
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

                        <Section id="projects" icon={<Sparkles />} title="Projects">
                             <div className="grid md:grid-cols-2 gap-8">
                                {portfolio.projects.map((project, index) => (
                                    <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
                                        {project.imageUrl && <Image src={project.imageUrl} alt={project.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint="project screenshot" />}
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                {project.title}
                                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                                    <LinkIcon className="w-5 h-5" />
                                                </a>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow flex flex-col">
                                            <p className="text-muted-foreground mb-4 flex-grow" dangerouslySetInnerHTML={{ __html: project.description.replace(/\n/g, '<br />') }}></p>
                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {project.tags.split(',').map(tag => tag.trim() && <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </Section>

                        <Section id="certificates" icon={<Award />} title="Certificates">
                            <div className="space-y-4">
                                {portfolio.certificates.map((cert, index) => (
                                    <Card key={index} className="p-4 flex items-start gap-4">
                                        {cert.imageUrl && <Image src={cert.imageUrl} alt={cert.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="certificate logo" />}
                                        <div>
                                            <p className="font-semibold">{cert.name}</p>
                                            <p className="text-sm text-muted-foreground">{cert.body} - {cert.date}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Section>

                        <Section id="achievements" icon={<Award />} title="Achievements">
                            <Card className="p-6">
                                <ul className="space-y-4">
                                    {portfolio.achievements.map((ach, index) => (
                                        <li key={index} className="flex items-start gap-4">
                                            {ach.imageUrl && <Image src={ach.imageUrl} alt="Achievement" width={40} height={40} className="rounded-md mt-1 object-cover" data-ai-hint="achievement award" />}
                                            <div className="flex-1">
                                                <Star className="w-4 h-4 text-primary inline-block mr-2" />
                                                <span className="text-muted-foreground">{ach.description}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </Section>

                        <Section id="testimonials" icon={<MessageSquare />} title="Testimonials">
                            <div className="space-y-6">
                                {portfolio.testimonials.map((test, index) => (
                                    <blockquote key={index} className="p-6 bg-muted/50 rounded-lg border-l-4 border-primary">
                                        <p className="italic text-lg">"{test.testimonial}"</p>
                                        <footer className="mt-4 text-right font-semibold">- {test.author}</footer>
                                    </blockquote>
                                ))}
                            </div>
                        </Section>

                        <Section id="faqs" icon={<HelpCircle />} title="FAQs">
                            <Accordion type="single" collapsible className="w-full">
                                {portfolio.faqs.map((faq, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                                        <AccordionContent className="text-base text-muted-foreground">
                                            <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </Section>
                    </main>
                </div>
                 <footer className="text-center p-6 border-t mt-16 space-y-4">
                    <a href="https://talxify.space" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                        <Bot />
                        <span>Powered by Talxify</span>
                    </a>
                    <p className="text-muted-foreground">© {new Date().getFullYear()} {portfolio.personalInfo.name}. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
