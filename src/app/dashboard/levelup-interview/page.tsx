
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    // Exclude arena interviews which have a specific topic structure
    return (userData.activity.filter(a => a.type === 'interview' && a.details.topic !== 'Icebreaker Introduction' && !a.details.topic.startsWith('Day ')) as InterviewActivity[])
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
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <section className="relative text-center rounded-2xl p-8 md:p-12 overflow-hidden bg-gradient-to-br from-primary/80 to-blue-500/80 text-primary-foreground shadow-2xl mb-12">
           <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
           <div className="relative z-10">
                <div className="mx-auto bg-white/20 text-primary-foreground rounded-full p-4 w-fit mb-6">
                    <MessageSquare className="h-10 w-10" />
                </div>
                <h1 className="font-headline text-5xl font-bold tracking-tighter">AI Mock Interview Generator</h1>
                <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                    Create a custom mock interview session. Specify the topic, role, and level to practice with our conversational AI.
                </p>
           </div>
        </section>

        <section>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Sparkles className="w-6 h-6 text-primary"/> Start a New Mock Interview</CardTitle>
                    <CardDescription>Fill in the details below to begin a new session with our AI interviewer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="topic"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Interview Topic</FormLabel>
                                            <FormControl><Input placeholder="e.g., System Design, Behavioral, React" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Role</FormLabel>
                                            <FormControl><Input placeholder="e.g., Frontend Developer" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Experience Level</FormLabel>
                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
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
                            <div className="pt-4 text-right">
                                <Button type="submit" size="lg">Start Interview</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </section>

        <section className="mt-12">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><History className="w-6 h-6"/> Interview History</CardTitle>
                    <CardDescription>Review your past mock interview sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isDataLoading ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>
                            <p>Loading history...</p>
                        </div>
                    ) : interviewHistory.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {interviewHistory.map(interview => (
                                    <TableRow key={interview.id}>
                                        <TableCell className="font-medium capitalize">{interview.details.topic}</TableCell>
                                        <TableCell><Badge variant="secondary">{interview.details.role}</Badge></TableCell>
                                        <TableCell className="font-semibold">{interview.details.score ?? 'N/A'}%</TableCell>
                                        <TableCell className="text-right">
                                             <Button asChild variant="outline" size="sm" disabled={!interview.analysis}>
                                                <Link href={`/dashboard/interview/${interview.id}/results`}>
                                                    <BarChart className="mr-2 h-4 w-4" />
                                                    View Report
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground p-8">You haven't completed any custom interviews yet.</p>
                    )}
                </CardContent>
            </Card>
        </section>
      </div>
    </main>
  );
}
