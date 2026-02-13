
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
        <main className="flex-1 overflow-auto p-6 lg:p-10">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-blue-600 to-indigo-900 px-8 py-16 md:px-16 text-primary-foreground shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />

                    <div className="relative z-10 space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold tracking-wide">
                            <Sparkles className="h-4 w-4 animate-pulse text-yellow-300" />
                            Next-Gen AI Interviewer
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                            Master Your Next <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 underline decoration-yellow-400/30">Interview</span>
                        </h1>
                        <p className="text-lg md:text-xl text-primary-foreground/80 font-medium leading-relaxed">
                            Create hyper-realistic, conversational mock interviews tailored to your target role and stack. Practice with our voice-enabled AI and get real-time feedback.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Generator Form */}
                    <div className="lg:col-span-5">
                        <Card className="h-full border-muted-foreground/10 bg-muted/20 backdrop-blur-sm overflow-hidden shadow-xl">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    New Session
                                </CardTitle>
                                <CardDescription className="text-base">Configure your practice arena parameters.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="topic"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Focus Topic</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., React, System Design"
                                                                className="h-12 bg-background/50 border-muted-foreground/10 focus:ring-primary/20 rounded-xl"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="role"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target Role</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., Senior Frontend Engineer"
                                                                className="h-12 bg-background/50 border-muted-foreground/10 focus:ring-primary/20 rounded-xl"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="level"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Experience Senority</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 bg-background/50 border-muted-foreground/10 rounded-xl">
                                                                    <SelectValue placeholder="Select level" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="entry-level">Entry-Level</SelectItem>
                                                                <SelectItem value="mid-level">Mid-Level</SelectItem>
                                                                <SelectItem value="senior">Senior</SelectItem>
                                                                <SelectItem value="principal">Principal / Staff</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button type="submit" size="lg" className="w-full h-14 text-lg font-black tracking-tight rounded-2xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                            Start Practicing
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* History Section */}
                    <div className="lg:col-span-7">
                        <Card className="h-full border-muted-foreground/10 bg-muted/20 backdrop-blur-sm shadow-xl overflow-hidden flex flex-col">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                                        <History className="w-6 h-6" />
                                    </div>
                                    Recent Sessions
                                </CardTitle>
                                <CardDescription className="text-base">Track your previous interview simulations.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                                {isDataLoading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                        <p className="font-bold">Gathering session data...</p>
                                    </div>
                                ) : interviewHistory.length > 0 ? (
                                    <div className="rounded-2xl border border-muted-foreground/10 bg-background/30 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Topic & Role</TableHead>
                                                    <TableHead className="hidden md:table-cell text-center text-[10px] font-black uppercase tracking-widest py-4">Readiness</TableHead>
                                                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-4 pr-6">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {interviewHistory.map((interview, idx) => (
                                                    <TableRow key={`${interview.id}-${idx}`} className="group border-b-border/10 hover:bg-primary/5 transition-colors">
                                                        <TableCell className="py-5">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-base capitalize group-hover:text-primary transition-colors">{interview.details.topic}</span>
                                                                <span className="text-xs text-muted-foreground font-medium">{interview.details.role}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-center py-5">
                                                            <div className={cn(
                                                                "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black border",
                                                                (interview.details.score ?? 0) >= 70 ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                                    (interview.details.score ?? 0) >= 40 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                                                        "bg-red-500/10 text-red-600 border-red-500/20"
                                                            )}>
                                                                {interview.details.score ?? 'N/A'}%
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right py-5 pr-6">
                                                            <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm" disabled={!interview.analysis}>
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
                                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/10 rounded-[2rem]">
                                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                                            <History className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="font-bold text-foreground opacity-60">Arena Empty</p>
                                        <p className="text-sm text-muted-foreground max-w-[200px] mt-1">Start your first AI simulation to see history here.</p>
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
