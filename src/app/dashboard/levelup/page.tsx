
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
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="relative text-center rounded-2xl p-8 md:p-12 overflow-hidden bg-gradient-to-br from-primary/80 to-blue-500/80 text-primary-foreground shadow-2xl mb-12">
           <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
           <div className="relative z-10">
                <div className="mx-auto bg-white/20 text-primary-foreground rounded-full p-4 w-fit mb-6">
                    <Rocket className="h-10 w-10" />
                </div>
                <h1 className="font-headline text-5xl font-bold tracking-tighter">Level Up Your Programming Skills</h1>
                <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                    Create custom coding challenges to target your weak spots and master any topic. Our AI will generate a unique quiz based on your needs.
                </p>
           </div>
        </section>

        {/* Form Section */}
        <section>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Sparkles className="w-6 h-6 text-primary"/> Create Your Custom Quiz</CardTitle>
                    <CardDescription>Specify your requirements below and let our AI build a tailored practice session for you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="topics"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Topics</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Arrays, Sorting, Dynamic Programming" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                    <FormField
                                        control={form.control}
                                        name="difficulty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Difficulty</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="easy">Easy</SelectItem>
                                                        <SelectItem value="moderate">Moderate</SelectItem>
                                                        <SelectItem value="difficult">Difficult</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="numQuestions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Questions</FormLabel>
                                                <FormControl><Input type="number" min="1" max="10" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="language"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Language</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="JavaScript">JavaScript</SelectItem>
                                                        <SelectItem value="Python">Python</SelectItem>
                                                        <SelectItem value="Java">Java</SelectItem>
                                                        <SelectItem value="TypeScript">TypeScript</SelectItem>
                                                        <SelectItem value="C++">C++</SelectItem>
                                                        <SelectItem value="Go">Go</SelectItem>
                                                        <SelectItem value="Rust">Rust</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 text-right">
                                <Button type="submit" size="lg">Generate Quiz</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </section>

        <section className="mt-12">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Custom Quiz History</CardTitle>
                    <CardDescription>Review your performance on quizzes you've generated.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isDataLoading ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>
                            <p>Loading history...</p>
                        </div>
                    ) : quizHistory.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quizHistory.map(quiz => (
                                    <TableRow key={quiz.id}>
                                        <TableCell className="font-medium capitalize">{quiz.topics}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                quiz.difficulty === 'easy' ? 'default' :
                                                quiz.difficulty === 'moderate' ? 'secondary' : 'destructive'
                                            } className="capitalize">{quiz.difficulty}</Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">{getOverallScore(quiz.analysis)}</TableCell>
                                        <TableCell className="text-right">
                                             <Button asChild variant="outline" size="sm" disabled={getOverallScore(quiz.analysis) === 'N/A'}>
                                                <Link href={`/dashboard/coding-quiz/analysis?id=${quiz.id}`}>
                                                    <BarChart className="mr-2 h-4 w-4" />
                                                    View Result
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground p-8">You haven't completed any custom quizzes yet.</p>
                    )}
                </CardContent>
            </Card>
        </section>
      </div>
    </main>
  );
}
