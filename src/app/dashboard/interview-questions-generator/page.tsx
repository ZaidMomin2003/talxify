
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Sparkles, Loader2, History, BarChart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { addActivity, getUserData, checkAndIncrementUsage } from '@/lib/firebase-service';
import type { UserData, InterviewQuestionSetActivity, GenerateInterviewQuestionsInput } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const questionsGeneratorSchema = z.object({
    role: z.string().min(2, "Please enter a job role."),
    description: z.string().min(10, "Please provide a brief job description."),
    level: z.enum(['entry-level', 'mid-level', 'senior', 'principal']),
    company: z.string().optional(),
});

type QuestionsGeneratorFormValues = z.infer<typeof questionsGeneratorSchema>;

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

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

export default function InterviewQuestionsGeneratorPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    const form = useForm<QuestionsGeneratorFormValues>({
        resolver: zodResolver(questionsGeneratorSchema),
        defaultValues: {
            role: '',
            description: '',
            level: 'mid-level',
            company: '',
        },
    });

    const fetchUserData = useCallback(async () => {
        if (user) {
            setIsHistoryLoading(true);
            const data = await getUserData(user.uid);
            setUserData(data);
            setIsHistoryLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const questionHistory = useMemo(() => {
        if (!userData?.activity) return [];
        return (userData.activity.filter(a => a.type === 'interview-question-set') as InterviewQuestionSetActivity[])
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [userData]);


    async function onSubmit(values: QuestionsGeneratorFormValues) {
        if (!user) {
            toast({ title: "Not Authenticated", description: "You need to be logged in to generate questions." });
            return;
        }

        const usageCheck = await checkAndIncrementUsage(user.uid, 'aiEnhancements');
        if (!usageCheck.success) {
            toast({ title: "Usage Limit Reached", description: usageCheck.message, variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateInterviewQuestions(values);

            const activity: InterviewQuestionSetActivity = {
                id: `iq-set-${Date.now()}`,
                type: 'interview-question-set',
                timestamp: new Date().toISOString(),
                questions: result,
                details: {
                    topic: values.role,
                    role: values.role,
                    level: values.level,
                    company: values.company || 'N/A'
                }
            };

            await addActivity(user.uid, activity);

            router.push(`/dashboard/interview-questions-generator/results?id=${activity.id}`);

        } catch (e: any) {
            console.error("Failed to generate questions:", e);
            toast({ title: "Generation Failed", description: e.message || "An error occurred.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
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
                        <MessageSquare className="h-8 w-8 text-primary" />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tight italic uppercase text-white leading-none">
                        Q&A <span className="text-primary">Engine</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground text-lg font-medium">
                        Generate tailored interview questions for any role, level, or company to sharpen your technical edge.
                    </motion.p>
                </div>

                <section>
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-white/5 bg-white/5">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                    Configure Assessment
                                </CardTitle>
                                <CardDescription className="text-base">Specify the parameters to generate a targeted set of interview questions.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormField
                                                control={form.control}
                                                name="role"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Job Role / Technology</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Senior React Developer" {...field} className="bg-black/20 border-white/5 h-14 focus:ring-primary/20 rounded-2xl text-base" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="level"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Experience Level</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-black/20 border-white/5 h-14 focus:ring-primary/20 rounded-2xl text-base">
                                                                    <SelectValue placeholder="Select level" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-secondary/90 backdrop-blur-xl border-white/10">
                                                                <SelectItem value="entry-level">Entry-Level</SelectItem>
                                                                <SelectItem value="mid-level">Mid-Level</SelectItem>
                                                                <SelectItem value="senior">Senior</SelectItem>
                                                                <SelectItem value="principal">Principal / Staff</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Job Context / Key Skills</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Quickly summarize the core requirements or paste a job snippet here..."
                                                            className="min-h-[120px] bg-black/20 border-white/5 focus:ring-primary/20 rounded-2xl resize-none text-base p-4"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="company"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Specific Company (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Google, Amazon, OpenAI" {...field} className="bg-black/20 border-white/5 h-14 focus:ring-primary/20 rounded-2xl text-base" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="pt-4 flex justify-end">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={isGenerating}
                                                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs italic shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all min-w-[240px]"
                                            >
                                                {isGenerating ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Sparkles className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />}
                                                {isGenerating ? 'Synthesizing...' : 'Generate Questions'}
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
                        <Card className="rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-white/5 bg-white/5">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <History className="w-6 h-6 text-primary" />
                                    Archive
                                </CardTitle>
                                <CardDescription className="text-base">Review your previously generated technical assessments.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isHistoryLoading ? (
                                    <div className="p-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary opacity-50" />
                                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Retrieving records...</p>
                                    </div>
                                ) : questionHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">Target Role</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Organization</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Timestamp</TableHead>
                                                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {questionHistory.map(item => (
                                                    <TableRow key={item.id} className="group border-b-white/5 hover:bg-primary/5 transition-all duration-300">
                                                        <TableCell className="py-6 px-8">
                                                            <span className="font-bold text-white group-hover:text-primary transition-colors block mb-0.5">{item.details.role}</span>
                                                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] h-5 font-black uppercase tracking-widest px-2">
                                                                {item.details.level.replace('-', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-6 font-medium text-muted-foreground">
                                                            {item.details.company || 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="py-6 text-muted-foreground text-sm">
                                                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                                        </TableCell>
                                                        <TableCell className="text-right py-6 px-8">
                                                            <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all px-5">
                                                                <Link href={`/dashboard/interview-questions-generator/results?id=${item.id}`}>
                                                                    <BarChart className="mr-2 h-4 w-4" />
                                                                    Explore Set
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
                                        <MessageSquare className="w-16 h-16 mx-auto" />
                                        <p className="font-black uppercase tracking-[0.2em] text-sm">No History Records</p>
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
