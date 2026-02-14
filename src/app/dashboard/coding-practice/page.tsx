
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rocket, Sparkles, Loader2, BarChart, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getUserData } from '@/lib/firebase-service';
import type { UserData, QuizResult } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const codingQuizSchema = z.object({
    topics: z.string().min(3, { message: "Please enter at least one topic." }),
    difficulty: z.enum(['easy', 'moderate', 'difficult']),
    numQuestions: z.coerce.number().int().min(1).max(10),
    language: z.string().min(1),
});

type CodingQuizFormValues = z.infer<typeof codingQuizSchema>;

const getOverallScore = (analysis: QuizResult['analysis']) => {
    if (!analysis || analysis.length === 0) return 'N/A';
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    return `${Math.round((totalScore / analysis.length) * 100)}%`;
};

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
};

export default function LevelUpPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const form = useForm<CodingQuizFormValues>({
        resolver: zodResolver(codingQuizSchema),
        defaultValues: {
            topics: '',
            difficulty: 'moderate',
            numQuestions: 3,
            language: 'JavaScript',
        },
    });

    const fetchUserData = useCallback(async () => {
        if (user) {
            setIsDataLoading(true);
            const data = await getUserData(user.uid);
            setUserData(data);
            setIsDataLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const quizHistory = useMemo(() => {
        if (!userData || !userData.activity) return [];
        // Filter for non-arena quizzes. Arena quizzes usually have a difficulty of "Izanami Mode"
        return (userData.activity.filter(a => a.type === 'quiz' && a.details.difficulty !== 'Izanami Mode') as QuizResult[])
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [userData]);


    function onSubmit(values: CodingQuizFormValues) {
        if (!user) {
            toast({
                title: "Not Authenticated",
                description: "You need to be logged in to start a quiz.",
                variant: "destructive"
            });
            router.push('/login');
            return;
        }
        const params = new URLSearchParams({
            topics: values.topics,
            difficulty: values.difficulty,
            numQuestions: String(values.numQuestions),
            language: values.language,
        });
        router.push(`/dashboard/coding-quiz/instructions?${params.toString()}`);
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-5xl mx-auto space-y-12 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
                        <Rocket className="h-8 w-8 text-primary" />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tight italic uppercase text-foreground leading-none">
                        Skill <span className="text-primary">Forge</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground text-lg font-medium">
                        Engineer your growth. AI-architected coding assessments built to expose and eliminate your technical blind spots.
                    </motion.p>
                </div>

                <section>
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                    Configure Assessment
                                </CardTitle>
                                <CardDescription className="text-base">Define your stack and intensity. We'll build the challenge.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="topics"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Focus Topics</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Kafka, System Design, Graph Theory" {...field} className="bg-muted/50 dark:bg-black/20 border-border dark:border-white/5 h-14 focus:ring-primary/20 rounded-2xl text-lg px-6" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                                <FormField
                                                    control={form.control}
                                                    name="difficulty"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Intensity</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-muted/50 dark:bg-black/20 border-border dark:border-white/5 h-14 rounded-2xl focus:ring-primary/20">
                                                                        <SelectValue placeholder="Select intensity" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="bg-popover border-border dark:border-white/10 rounded-xl">
                                                                    <SelectItem value="easy">Easy (Fundamentals)</SelectItem>
                                                                    <SelectItem value="moderate">Moderate (Industrial)</SelectItem>
                                                                    <SelectItem value="difficult">Difficult (Elite)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className="text-[10px] font-bold" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="numQuestions"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quest Count</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min="1" max="10" {...field} className="bg-muted/50 dark:bg-black/20 border-border dark:border-white/5 h-14 focus:ring-primary/20 rounded-2xl text-lg px-6" />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px] font-bold" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="language"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Environment</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-muted/50 dark:bg-black/20 border-border dark:border-white/5 h-14 rounded-2xl focus:ring-primary/20">
                                                                        <SelectValue placeholder="Select language" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="bg-popover border-border dark:border-white/10 rounded-xl">
                                                                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                                                                    <SelectItem value="Python">Python</SelectItem>
                                                                    <SelectItem value="Java">Java</SelectItem>
                                                                    <SelectItem value="TypeScript">TypeScript</SelectItem>
                                                                    <SelectItem value="C++">C++</SelectItem>
                                                                    <SelectItem value="Go">Go</SelectItem>
                                                                    <SelectItem value="Rust">Rust</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className="text-[10px] font-bold" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs italic shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all min-w-[240px]"
                                            >
                                                Initiate Assessment
                                                <Rocket className="ml-3 h-5 w-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>

                <section>
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <RefreshCw className="w-6 h-6 text-primary" />
                                    Performance Archives
                                </CardTitle>
                                <CardDescription className="text-base">Review your historical data and assessment metrics.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isDataLoading ? (
                                    <div className="p-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary opacity-50" />
                                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing archives...</p>
                                    </div>
                                ) : quizHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted dark:bg-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">Topic / Tech</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Intensity</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Efficiency</TableHead>
                                                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {quizHistory.map(quiz => (
                                                    <TableRow key={quiz.id} className="group border-b-border dark:border-b-white/5 hover:bg-primary/5 transition-all duration-300">
                                                        <TableCell className="py-6 px-8">
                                                            <span className="font-bold text-foreground group-hover:text-primary transition-colors block capitalize text-lg tracking-tight">
                                                                {quiz.topics}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                                                Environment: {quiz.details.language || 'Code'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="py-6">
                                                            <Badge variant={
                                                                quiz.difficulty === 'easy' ? 'default' :
                                                                    quiz.difficulty === 'moderate' ? 'secondary' : 'destructive'
                                                            } className="h-6 text-[9px] font-black uppercase tracking-widest px-3 rounded-lg">
                                                                {quiz.difficulty}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-6 font-black italic text-xl">
                                                            {getOverallScore(quiz.analysis)}
                                                        </TableCell>
                                                        <TableCell className="text-right py-6 px-8">
                                                            <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all px-5" disabled={getOverallScore(quiz.analysis) === 'N/A'}>
                                                                <Link href={`/dashboard/coding-quiz/analysis?id=${quiz.id}`}>
                                                                    <BarChart className="mr-2 h-4 w-4" />
                                                                    View Intel
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="p-20 text-center space-y-4 opacity-30">
                                        <Rocket className="w-16 h-16 mx-auto" />
                                        <p className="font-black uppercase tracking-[0.2em] text-sm">No Missions Logged</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>
            </motion.div>
        </main>
    );
}
