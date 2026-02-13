

'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Github, Linkedin, Instagram, Mail, Phone, Link as LinkIcon, Award, Briefcase, MessageSquare, GraduationCap, Sparkles, Building, Calendar, Star, Code, Twitter, Globe, School, Percent, Loader2, Bot, User as UserIcon, BarChart, Youtube, HelpCircle, Menu, Eye, UserCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import type { UserData, QuizResult, Portfolio, InterviewActivity } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { initialPortfolioData } from "@/lib/initial-data";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Section = ({ icon, title, children, className, id, isVisible }: { icon: React.ReactNode, title: string, children: React.ReactNode, className?: string, id: string, isVisible?: boolean }) => {
    if (isVisible === false) return null;

    return (
        <motion.section
            variants={itemVariants}
            id={id}
            className={cn("py-12 scroll-mt-24", className)}
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/10 text-primary rounded-xl p-3 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                    {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic text-white leading-none">{title}</h2>
            </div>
            {children}
        </motion.section>
    )
};

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
    { href: "#testimonials", label: "Reviews" },
    { href: "#faqs", label: "FAQs" },
];

function PortfolioHeader({ name, email, imageUrl, onRecruiterModeToggle, isRecruiterMode }: { name: string, email: string, imageUrl?: string, onRecruiterModeToggle: (checked: boolean) => void, isRecruiterMode: boolean }) {
    return (
        <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="p-1 rounded-full bg-gradient-to-tr from-primary/50 to-transparent">
                            <Avatar className="w-10 h-10 border border-white/20">
                                <AvatarImage src={imageUrl} alt={name} data-ai-hint="person avatar" />
                                <AvatarFallback className="bg-black font-black italic">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </div>
                        <span className="font-black text-lg uppercase tracking-tight italic hidden sm:block">{name}</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-2">
                        {navLinks.map(link => (
                            <Button key={link.href} variant="ghost" asChild className="text-[10px] font-black uppercase tracking-widest italic hover:bg-white/5 hover:text-primary transition-all">
                                <a href={link.href}>{link.label}</a>
                            </Button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center space-x-3 bg-black/20 p-2 rounded-xl border border-white/5">
                            <Eye className="w-4 h-4 text-primary" />
                            <Label htmlFor="recruiter-mode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer">Recruiter Mode</Label>
                            <Switch id="recruiter-mode" checked={isRecruiterMode} onCheckedChange={onRecruiterModeToggle} />
                        </div>
                        <Button asChild className="hidden sm:flex rounded-xl font-black uppercase tracking-tight italic h-10 px-6 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            <a href={`mailto:${email}`}>Hire Me</a>
                        </Button>
                        <div className="md:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-black/40">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[200px]">
                                    {navLinks.map(link => (
                                        <DropdownMenuItem key={link.href} asChild className="rounded-xl focus:bg-white/10">
                                            <a href={link.href} className="w-full text-[10px] font-black uppercase tracking-widest italic py-3">{link.label}</a>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuItem asChild className="rounded-xl bg-primary/10 mt-2 focus:bg-primary/20">
                                        <a href={`mailto:${email}`} className="w-full text-[10px] font-black uppercase tracking-widest italic py-3 text-primary">Establish Link</a>
                                    </DropdownMenuItem>
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
        <div className="bg-black min-h-screen relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed top-0 right-0 -mt-32 -mr-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 left-0 -mb-32 -ml-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
                            <Skeleton className="h-6 w-32 rounded-md bg-white/5" />
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-20 rounded-md bg-white/5" />)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-32 rounded-xl bg-white/5" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-10 relative z-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                    <aside className="lg:col-span-4 lg:sticky lg:top-28 self-start mb-12 lg:mb-0">
                        <Card className="p-8 rounded-[3rem] border-white/10 bg-black/40 backdrop-blur-xl border text-center animate-pulse">
                            <Skeleton className="w-40 h-40 mx-auto mb-6 rounded-[2rem] bg-white/5" />
                            <Skeleton className="h-8 w-3/4 mx-auto mb-2 rounded-md bg-white/5" />
                            <Skeleton className="h-4 w-1/2 mx-auto mb-8 rounded-md bg-white/5" />
                            <div className="flex justify-center gap-2 mb-8">
                                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-10 h-10 rounded-xl bg-white/5" />)}
                            </div>
                            <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
                        </Card>
                    </aside>
                    <main className="lg:col-span-8 space-y-12">
                        <Skeleton className="w-full h-56 md:h-80 rounded-[2.5rem] bg-white/5 animate-pulse shadow-2xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-48 rounded-xl bg-white/5 mb-4" />
                            <Skeleton className="h-32 w-full rounded-[2rem] bg-white/5" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-48 rounded-xl bg-white/5 mb-4" />
                            <div className="grid gap-6 sm:grid-cols-3">
                                <Skeleton className="h-32 w-full rounded-3xl bg-white/5" />
                                <Skeleton className="h-32 w-full rounded-3xl bg-white/5" />
                                <Skeleton className="h-32 w-full rounded-3xl bg-white/5" />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

const RecruiterModeView = ({ portfolio, questionsSolved, interviewsCompleted, averageScore }: { portfolio: Portfolio, questionsSolved: number, interviewsCompleted: number, averageScore: number }) => {
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
            <motion.div variants={itemVariants}>
                <Card className="rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                    <div className="grid md:grid-cols-3 items-center">
                        <div className="md:col-span-1 relative h-full min-h-[300px]">
                            <Image src={portfolio.personalInfo.avatarUrl || "https://placehold.co/400x400.png"} alt={portfolio.personalInfo.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" data-ai-hint="person portrait" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40 pointer-events-none" />
                        </div>
                        <div className="md:col-span-2 p-10 md:p-14 space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight italic text-white leading-none">{portfolio.personalInfo.name}</h1>
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-primary italic opacity-80">{portfolio.personalInfo.profession}</h2>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{portfolio.personalInfo.bio}</p>
                            <div className="flex flex-wrap items-center gap-6 pt-4">
                                <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-tight italic shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105" asChild>
                                    <a href={`mailto:${portfolio.personalInfo.email}`}><Mail className="mr-3 h-4 w-4" />Hire Me</a>
                                </Button>
                                <div className="flex gap-4">
                                    <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-white/10 bg-white/5 hover:border-primary/50 text-white transition-all hover:text-primary" asChild>
                                        <a href={portfolio.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="w-5 h-5" /></a>
                                    </Button>
                                    <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-white/10 bg-white/5 hover:border-primary/50 text-white transition-all hover:text-primary" asChild>
                                        <a href={portfolio.socials.github} target="_blank" rel="noopener noreferrer"><Github className="w-5 h-5" /></a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-3">
                {[
                    { label: "Interviews", value: interviewsCompleted, sub: "Completed" },
                    { label: "Solved", value: questionsSolved, sub: "Results" },
                    { label: "Performance", value: `${averageScore}%`, sub: "Average Score" }
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Card className="rounded-3xl border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-primary/20 transition-all group">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{stat.label}</Label>
                            <div className="text-4xl font-black italic mt-2 text-white">{stat.value}</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1 italic">{stat.sub}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={itemVariants}>
                <Card className="rounded-[2rem] border-white/10 bg-black/40 backdrop-blur-xl border p-10">
                    <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-primary" />
                            Technical Skills
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-wrap gap-3">
                        {portfolio.skills.slice(0, 12).map(skill => (
                            <Badge key={skill.skill} variant="secondary" className="bg-white/5 hover:bg-white/10 border-white/10 text-xs font-black uppercase tracking-widest italic py-2 px-4 rounded-lg text-white/80">{skill.skill}</Badge>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {portfolio.projects.length > 0 && (
                <motion.div variants={itemVariants}>
                    <Card className="rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                        <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                <Eye className="w-6 h-6 text-primary" />
                                Featured Project: {portfolio.projects[0].title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid lg:grid-cols-2 gap-10 items-center">
                                {portfolio.projects[0].imageUrl && (
                                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                                        <Image src={portfolio.projects[0].imageUrl} alt={portfolio.projects[0].title} fill className="object-cover" />
                                    </div>
                                )}
                                <div className="space-y-6">
                                    <p className="text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-6">{portfolio.projects[0].description}</p>
                                    <Button className="h-12 px-10 rounded-xl font-black uppercase tracking-tight italic shadow-[0_0_20px_rgba(var(--primary),0.2)]" asChild>
                                        <a href={portfolio.projects[0].link} target="_blank" rel="noopener noreferrer">View Project <LinkIcon className="ml-3 h-4 w-4" /></a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    )
}

export default function PortfolioComponent({ userData }: { userData: UserData | null }) {
    const [isRecruiterMode, setIsRecruiterMode] = useState(false);
    const portfolio = userData?.portfolio;

    const displayOptions = portfolio?.displayOptions ?? initialPortfolioData.portfolio.displayOptions;

    const { questionsSolved, interviewsCompleted, averageScore } = useMemo(() => {
        if (!userData?.activity) {
            return { questionsSolved: 0, interviewsCompleted: 0, averageScore: 0 };
        }
        const quizzes = userData.activity.filter(item => item.type === 'quiz') as QuizResult[];
        const interviews = userData.activity.filter(item => item.type === 'interview') as InterviewActivity[];
        const completedQuizzes = quizzes.filter(item => item.analysis.length > 0);
        const completedInterviews = interviews.filter(item => item.analysis && item.analysis.crackingChance !== undefined);

        const solved = quizzes.reduce((acc, quiz) => acc + quiz.quizState.length, 0);

        const totalQuizScore = completedQuizzes.reduce((sum, quiz) => {
            const quizAvg = quiz.analysis.reduce((s, a) => s + a.score, 0) / Math.max(quiz.analysis.length, 1);
            return sum + quizAvg * 100;
        }, 0);

        const totalInterviewScore = completedInterviews.reduce((sum, interview) => sum + (interview.analysis?.crackingChance || 0), 0);

        const totalActivities = completedQuizzes.length + completedInterviews.length;
        const totalScore = totalQuizScore + totalInterviewScore;

        const avgScore = totalActivities > 0 ? Math.round(totalScore / totalActivities) : 0;

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

    if (!userData || !portfolio) {
        return <PortfolioLoadingSkeleton />;
    }

    const youtubeEmbedUrl = getYouTubeEmbedUrl(portfolio?.personalInfo.youtubeVideoUrl);

    return (
        <div
            className="bg-black text-white min-h-screen relative selection:bg-primary/30"
            style={{ '--primary': portfolio.themeColor } as React.CSSProperties}
        >
            {/* Decorative Background Elements */}
            <div className="fixed top-0 right-0 -mt-32 -mr-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" />
            <div className="fixed bottom-0 left-0 -mb-32 -ml-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            <PortfolioHeader
                name={portfolio.personalInfo.name}
                email={portfolio.personalInfo.email}
                imageUrl={portfolio.personalInfo.avatarUrl}
                onRecruiterModeToggle={setIsRecruiterMode}
                isRecruiterMode={isRecruiterMode}
            />
            <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-10 relative z-10">
                {isRecruiterMode ? (
                    <RecruiterModeView
                        portfolio={portfolio}
                        questionsSolved={questionsSolved}
                        interviewsCompleted={interviewsCompleted}
                        averageScore={averageScore}
                    />
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                        {/* Sticky Sidebar */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-32 self-start mb-12 lg:mb-0">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-8"
                            >
                                <motion.div variants={itemVariants}>
                                    <Card className="rounded-[3rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border p-8 text-center relative group">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                                        <div className="relative inline-block mb-6">
                                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-3xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="w-40 h-40 mx-auto border-2 border-white/10 p-1 bg-black shadow-2xl relative z-10 rounded-[2.5rem] overflow-hidden">
                                                {portfolio.personalInfo.avatarUrl ? (
                                                    <Image
                                                        src={portfolio.personalInfo.avatarUrl}
                                                        alt={portfolio.personalInfo.name}
                                                        width={160}
                                                        height={160}
                                                        className="w-full h-full object-cover rounded-[2rem]"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-black rounded-[2rem] text-4xl font-black italic">
                                                        {portfolio.personalInfo.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mb-1 text-white whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-2xl">{portfolio.personalInfo.name}</h1>
                                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary italic mb-8 opacity-80">{portfolio.personalInfo.profession}</p>

                                        <div className="flex justify-center gap-2 mb-8">
                                            {[
                                                { icon: <Github />, url: portfolio.socials.github },
                                                { icon: <Linkedin />, url: portfolio.socials.linkedin },
                                                { icon: <Twitter />, url: portfolio.socials.twitter },
                                                { icon: <Globe />, url: portfolio.socials.website }
                                            ].map((soc, i) => (
                                                <Button key={i} variant="outline" size="icon" className="w-10 h-10 rounded-xl border-white/10 bg-white/5 hover:border-primary/50 text-white/70 hover:text-primary transition-all active:scale-90" asChild>
                                                    <a href={soc.url} target="_blank" rel="noopener noreferrer">{soc.icon}</a>
                                                </Button>
                                            ))}
                                        </div>

                                        <Button asChild className="w-full h-12 rounded-xl font-black uppercase tracking-tight italic shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02] active:scale-95 mb-8">
                                            <a href={`mailto:${portfolio.personalInfo.email}`}>
                                                <Mail className="mr-3 h-4 w-4" /> Hire Me
                                            </a>
                                        </Button>

                                        {displayOptions.showSkills && (
                                            <div className="pt-8 border-t border-white/5">
                                                <div className="flex items-center justify-center gap-2 mb-4">
                                                    <Code className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic text-white/40">Technical Stack</span>
                                                </div>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {portfolio.skills.slice(0, 12).map((skill) => (
                                                        <Badge key={skill.skill} variant="secondary" className="bg-white/5 border-white/10 text-[8px] font-black uppercase tracking-widest italic py-1 px-2.5 rounded-lg text-white/60">
                                                            {skill.skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            </motion.div>
                        </aside>

                        {/* Main Content */}
                        <main className="lg:col-span-8">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                <motion.div variants={itemVariants} className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <Image src={portfolio.personalInfo.bannerUrl || 'https://placehold.co/1200x300.png'} alt="Portfolio Banner" width={1200} height={400} className="w-full h-56 md:h-80 object-cover rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10 grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" data-ai-hint="abstract banner" />
                                </motion.div>

                                <Section id="about" icon={<UserIcon />} title="About Me" isVisible={displayOptions.showAbout}>
                                    <Card className="p-8 rounded-[2rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-xl border">
                                        <p className="text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-6">{portfolio.personalInfo.bio}</p>
                                    </Card>
                                </Section>

                                {portfolio.personalInfo.developmentPhilosophy && (
                                    <Section id="philosophy" icon={<UserCheck />} title="My Development Philosophy">
                                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground text-lg">
                                            "{portfolio.personalInfo.developmentPhilosophy}"
                                        </blockquote>
                                    </Section>
                                )}

                                {youtubeEmbedUrl && (
                                    <Section id="video-intro" icon={<Youtube />} title="Video Introduction" isVisible={displayOptions.showVideo}>
                                        <Card className="overflow-hidden rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl border p-2">
                                            <div className="aspect-video rounded-[2rem] overflow-hidden">
                                                <iframe
                                                    className="w-full h-full grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                                                    src={youtubeEmbedUrl}
                                                    title="YouTube video player"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        </Card>
                                    </Section>
                                )}


                                <Section id="stats" icon={<Percent />} title="Activity Metrics" isVisible={displayOptions.showStats}>
                                    <div className="mb-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                            <UserCheck className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Verified Data Stream</p>
                                            <p className="text-xs text-muted-foreground/80 italic">This is an original unedited section containing verified platform activity data.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {[
                                            {
                                                title: "Total Interviews",
                                                count: interviewsCompleted,
                                                bgColor: "bg-[#ffcd52]",
                                                label: "RECORDS",
                                                icon: <Briefcase />
                                            },
                                            {
                                                title: "Avg. Performance",
                                                count: `${averageScore}%`,
                                                bgColor: "bg-[#b8a2ff]",
                                                label: "SCORE",
                                                icon: <Percent />
                                            },
                                            {
                                                title: "Coding Questions Solved",
                                                count: questionsSolved,
                                                bgColor: "bg-[#c4f068]",
                                                label: "MASTERY",
                                                icon: <Code />
                                            },
                                        ].map((stat, i) => (
                                            <div key={i} className={cn(
                                                "relative h-[220px] rounded-[32px] overflow-hidden transition-all duration-500 group shadow-lg",
                                                stat.bgColor
                                            )}>
                                                {/* Glossy overlay */}
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="p-8 h-full flex flex-col justify-between relative z-10">
                                                    <div>
                                                        <h3 className="text-black font-black text-lg tracking-tight leading-tight uppercase italic opacity-80">
                                                            {stat.title}
                                                        </h3>
                                                    </div>

                                                    <div>
                                                        <div className="text-black/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1 italic">
                                                            {stat.label}
                                                        </div>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-black font-black text-5xl tracking-tighter italic">
                                                                {stat.count}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Decorative Icon */}
                                                    <div className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-black/10 flex items-center justify-center transition-all duration-500 group-hover:bg-black group-hover:scale-110 group-hover:rotate-12 shadow-xl">
                                                        {React.cloneElement(stat.icon as React.ReactElement, { className: "h-5 w-5 text-black group-hover:text-white transition-colors" })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Section>

                                <Section id="skill-proficiency" icon={<BarChart />} title="Proficiency" isVisible={displayOptions.showSkills}>
                                    <Card className="p-6 rounded-[2rem] border-white/10 bg-black/40 backdrop-blur-xl border overflow-hidden">
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart
                                                    data={portfolio.skills}
                                                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="colorExpertise" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                    <XAxis dataKey="skill" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }} />
                                                    <Area type="monotone" dataKey="expertise" name="Proficiency" stroke="hsl(var(--primary))" fill="url(#colorExpertise)" strokeWidth={3} activeDot={{ r: 6, style: { fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#000' } }} animationDuration={2000} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Section>

                                <Section id="experience" icon={<Briefcase />} title="Experience" isVisible={displayOptions.showExperience}>
                                    <div className="space-y-6 relative before:absolute before:inset-y-0 before:w-px before:bg-white/10 before:left-6">
                                        {portfolio.experience.map((exp, index) => (
                                            <motion.div key={index} variants={itemVariants} className="relative pl-14 group">
                                                <div className="absolute left-6 -translate-x-1/2 top-1.5 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] group-hover:scale-125 transition-transform" />
                                                <Card className="p-8 rounded-[1.5rem] border-white/5 bg-black/20 backdrop-blur-sm border hover:border-primary/20 transition-all">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-black uppercase tracking-tight italic text-white leading-tight">{exp.role}</h3>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{exp.company}</span>
                                                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">{exp.duration}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground leading-relaxed italic" dangerouslySetInnerHTML={{ __html: exp.description.replace(/\n/g, '<br />') }}></p>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Section>

                                <Section id="education" icon={<School />} title="Education" isVisible={displayOptions.showEducation}>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {portfolio.education.map((edu, index) => (
                                            <Card key={index} className="p-6 rounded-2xl border-white/5 bg-black/40 backdrop-blur-xl border flex items-center gap-5 group hover:border-primary/20 transition-all">
                                                <div className="bg-primary/5 text-primary rounded-xl p-4 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                    <School className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase tracking-tight italic text-white text-lg leading-tight">{edu.degree}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1 italic">{edu.institution} &bull; {edu.year}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </Section>

                                <Section id="projects" icon={<Sparkles />} title="Projects" isVisible={displayOptions.showProjects}>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {portfolio.projects.map((project, index) => (
                                            <motion.div key={index} variants={itemVariants}>
                                                <Card className="rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border flex flex-col h-full group">
                                                    <div className="relative aspect-video overflow-hidden">
                                                        {project.imageUrl && <Image src={project.imageUrl} alt={project.title} fill className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" data-ai-hint="project screenshot" />}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Button variant="outline" size="icon" className="w-12 h-12 rounded-2xl bg-black border-white/20 hover:border-primary/50 text-white" asChild>
                                                                <a href={project.link} target="_blank" rel="noopener noreferrer"><LinkIcon className="w-5 h-5" /></a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <CardHeader className="p-8 pb-4">
                                                        <CardTitle className="text-xl font-black uppercase tracking-tight italic text-white">
                                                            {project.title}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-8 pt-0 flex-grow flex flex-col">
                                                        <p className="text-muted-foreground mb-6 flex-grow italic border-l border-primary/20 pl-4" dangerouslySetInnerHTML={{ __html: project.description.replace(/\n/g, '<br />') }}></p>
                                                        <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-white/5">
                                                            {project.tags.split(',').map(tag => tag.trim() && (
                                                                <Badge key={tag} variant="secondary" className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest italic py-1 px-3 text-white/50">{tag}</Badge>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Section>

                                <Section id="certificates" icon={<Award />} title="Certificates" isVisible={displayOptions.showCertificates}>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {portfolio.certificates.map((cert, index) => (
                                            <Card key={index} className="p-6 rounded-2xl border-white/5 bg-black/40 backdrop-blur-xl border flex items-center gap-5 group hover:border-primary/20 transition-all">
                                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                                                    {cert.imageUrl ? (
                                                        <Image src={cert.imageUrl} alt={cert.name} fill className="object-cover" data-ai-hint="certificate logo" />
                                                    ) : (
                                                        <Award className="w-full h-full p-3 text-primary/50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase tracking-tight italic text-white leading-tight">{cert.name}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1 italic">{cert.body} &bull; {cert.date}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </Section>

                                <Section id="achievements" icon={<Award />} title="Achievements" isVisible={displayOptions.showAchievements}>
                                    <Card className="p-8 rounded-[2rem] border-white/5 bg-black/40 backdrop-blur-xl border">
                                        <ul className="grid gap-6">
                                            {portfolio.achievements.map((ach, index) => (
                                                <li key={index} className="flex items-start gap-6 group">
                                                    <div className="mt-1 relative shrink-0">
                                                        {ach.imageUrl ? (
                                                            <Image src={ach.imageUrl} alt="Achievement" width={48} height={48} className="rounded-xl object-cover border border-white/10" data-ai-hint="achievement award" />
                                                        ) : (
                                                            <Star className="w-6 h-6 text-primary" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 border-l border-white/5 pl-6 group-hover:border-primary/30 transition-colors">
                                                        <span className="text-muted-foreground leading-relaxed italic">{ach.description}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </Section>

                                <Section id="testimonials" icon={<MessageSquare />} title="Testimonials" isVisible={displayOptions.showTestimonials}>
                                    <div className="grid gap-6">
                                        {portfolio.testimonials.map((test, index) => (
                                            <Card key={index} className="p-8 rounded-[2rem] border-white/5 bg-black/40 backdrop-blur-xl border relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-30 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative">
                                                    <p className="italic text-white text-lg md:text-xl font-bold leading-relaxed mb-6">"{test.testimonial}"</p>
                                                    <footer className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">&mdash; {test.author}</footer>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </Section>

                                <Section id="faqs" icon={<HelpCircle />} title="FAQs" isVisible={displayOptions.showFaqs}>
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        {portfolio.faqs.map((faq, index) => (
                                            <AccordionItem value={`item-${index}`} key={index} className="border-none">
                                                <AccordionTrigger className="text-sm font-black uppercase tracking-widest italic text-white hover:text-primary transition-colors bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 px-8 py-6 hover:no-underline">
                                                    {faq.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-base text-muted-foreground pt-6 px-8 leading-relaxed italic border-l border-primary/20 ml-4 mt-2">
                                                    <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }} />
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </Section>
                            </motion.div>
                        </main>
                    </div>
                )}
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
