
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Sparkles, Loader2, History, BarChart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getUserData } from '@/lib/firebase-service';
import type { UserData, InterviewActivity } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const interviewGeneratorSchema = z.object({
    topic: z.string().min(3, "Please enter a topic."),
    role: z.string().min(2, "Please enter a job role."),
    level: z.string().min(2, "Please enter a job level."),
});

type InterviewGeneratorFormValues = z.infer<typeof interviewGeneratorSchema>;

export default function LevelUpInterviewPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const form = useForm<InterviewGeneratorFormValues>({
        resolver: zodResolver(interviewGeneratorSchema),
        defaultValues: {
            topic: '',
            role: '',
            level: 'entry-level',
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

    const interviewHistory = useMemo(() => {
        if (!userData || !userData.activity) return [];
        const interviews = userData.activity.filter(a =>
            a.type === 'interview' &&
            a.details.topic !== 'Icebreaker Introduction' &&
            !a.details.topic.startsWith('Day ')
        ) as InterviewActivity[];

        // De-duplicate by ID and sort by timestamp
        const uniqueMap = new Map();
        interviews.forEach(i => uniqueMap.set(i.id, i));

        return Array.from(uniqueMap.values())
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [userData]);

    function onSubmit(values: InterviewGeneratorFormValues) {
        if (!user) {
            toast({
                title: "Not Authenticated",
                description: "You need to be logged in to start an interview.",
                variant: "destructive"
            });
            router.push('/login');
            return;
        }
        const meetingId = user.uid + "_" + Date.now();
        const params = new URLSearchParams({
            topic: values.topic,
            role: values.role,
            level: values.level,
        });
        router.push(`/dashboard/interview/${meetingId}/instructions?${params.toString()}`);
    }

    return (
        <main className="flex-1 overflow-auto bg-background selection:bg-primary/30 selection:text-white transition-colors duration-500">
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
                {/* Refined Page Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">
                            <Sparkles className="h-3 w-3" />
                            Simulation Protocol
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground">
                            AI Mock <span className="text-primary">Interviews.</span>
                        </h1>
                        <p className="text-muted-foreground font-medium italic text-sm max-w-xl">
                            Configure your high-fidelity practice environment. Our voice-enabled AI adapts to your role and tech stack in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Total Practice Sessions</span>
                            <span className="text-2xl font-black italic text-foreground">{interviewHistory.length}</span>
                        </div>
                        <div className="h-12 w-px bg-border hidden sm:block" />
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted border border-border text-primary shadow-sm">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Generator Form Card */}
                    <div className="lg:col-span-4 translate-y-0">
                        <Card className="relative h-full bg-card/50 dark:bg-[#0d0d0d]/40 backdrop-blur-3xl border-border dark:border-white/5 shadow-2xl overflow-hidden rounded-[2.5rem] group/card transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full group-hover/card:bg-primary/10 transition-colors duration-700" />

                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_15px_rgba(230,57,70,0.3)] animate-vivid-gradient [background-size:200%_200%]">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    Setup Session
                                </CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Arena Configuration</CardDescription>
                            </CardHeader>

                            <CardContent className="p-8 pt-4">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1 italic">Focus Topic</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., React, System Design"
                                                            className="h-12 bg-background/50 dark:bg-white/5 border-border dark:border-white/10 focus:border-primary/50 text-foreground rounded-xl font-medium italic transition-all duration-300"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold italic" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-[10px) font-black uppercase tracking-[0.2em] text-muted-foreground pl-1 italic">Target Role</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., Senior Frontend Engineer"
                                                            className="h-12 bg-background/50 dark:bg-white/5 border-border dark:border-white/10 focus:border-primary/50 text-foreground rounded-xl font-medium italic transition-all duration-300"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold italic" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="level"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1 italic">Seniority Level</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 bg-background/50 dark:bg-white/5 border-border dark:border-white/10 focus:border-primary/50 text-foreground rounded-xl font-medium italic transition-all duration-300">
                                                                <SelectValue placeholder="Select level" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                                                            <SelectItem value="entry-level">Entry-Level</SelectItem>
                                                            <SelectItem value="mid-level">Mid-Level</SelectItem>
                                                            <SelectItem value="senior">Senior</SelectItem>
                                                            <SelectItem value="principal">Principal / Staff</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px] uppercase font-bold italic" />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest text-base shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-2xl group/btn overflow-hidden mt-4"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                Initialize Protocol <Sparkles className="h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
                                            </span>
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* History Section Card */}
                    <div className="lg:col-span-8">
                        <Card className="h-full bg-card/50 dark:bg-[#0d0d0d]/40 backdrop-blur-3xl border-border dark:border-white/5 shadow-2xl overflow-hidden rounded-[2.5rem] flex flex-col">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                                        <History className="h-5 w-5" />
                                    </div>
                                    Simulation Log
                                </CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Previous Sessions & Analytics</CardDescription>
                            </CardHeader>

                            <CardContent className="p-8 pt-4 flex-1 flex flex-col">
                                {isDataLoading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Retrieving protocol data...</p>
                                    </div>
                                ) : interviewHistory.length > 0 ? (
                                    <div className="rounded-2xl border border-border dark:border-white/5 bg-background/50 dark:bg-white/[0.02] overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/50 dark:bg-white/[0.03]">
                                                <TableRow className="hover:bg-transparent border-border dark:border-white/5">
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 pl-6 italic">Simulation Identity</TableHead>
                                                    <TableHead className="hidden md:table-cell text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 italic">Tactical Score</TableHead>
                                                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 pr-6 italic">Analytics</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {interviewHistory.map((interview, idx) => (
                                                    <TableRow key={`${interview.id}-${idx}`} className="group border-border dark:border-white/5 hover:bg-primary/5 transition-colors">
                                                        <TableCell className="py-5 pl-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-black italic uppercase text-sm text-foreground group-hover:text-primary transition-colors tracking-tight">{interview.details.topic}</span>
                                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{interview.details.role}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-center py-5">
                                                            <div className={cn(
                                                                "inline-flex items-center justify-center h-8 px-4 rounded-lg text-[10px] font-black italic border transition-all duration-500",
                                                                (interview.details.score ?? 0) >= 70 ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 shadow-sm" :
                                                                    (interview.details.score ?? 0) >= 40 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" :
                                                                        "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
                                                            )}>
                                                                {interview.details.score ?? '0'}% READY
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right py-5 pr-6">
                                                            <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted border border-border hover:bg-primary hover:text-white hover:border-primary transition-all duration-300" disabled={!interview.analysis}>
                                                                <Link href={`/dashboard/interview/${interview.id}/results`}>
                                                                    <BarChart className="h-5 w-5" />
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border dark:border-white/5 rounded-[2.5rem] bg-muted/20 dark:bg-white/[0.01]">
                                        <div className="p-5 rounded-2xl bg-muted border border-border mb-6 text-muted-foreground">
                                            <History className="h-8 w-8 opacity-40" />
                                        </div>
                                        <p className="text-xl font-black italic uppercase tracking-tighter text-foreground opacity-40">No Simulations Yet</p>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest max-w-[240px] mt-2">Initialize your first simulation protocol to generate analytics.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
