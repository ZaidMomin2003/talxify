
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Code, Briefcase, Percent, Search, RefreshCw, BarChart, Info, CalendarDays, Loader2, Lock, Building, BrainCircuit, User, Gem } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { StoredActivity, QuizResult, InterviewActivity, UserData } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { getUserData } from "@/lib/firebase-service";
import { differenceInDays, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';


const codingGymSchema = z.object({
  topics: z.string().min(1, "Topics are required."),
  difficulty: z.enum(["easy", "moderate", "difficult"]),
  numQuestions: z.string(),
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
        <p className="label text-muted-foreground">{`${label}`}</p>
        <div style={{ color: payload[0].color }} className="flex items-center gap-2 font-semibold">
          <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: payload[0].fill}}/>
          Score: {payload[0].value}%
        </div>
      </div>
    );
  }

  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isCodingLoading, setIsCodingLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);

  const fetchUserData = useCallback(async () => {
    if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const allActivity = userData?.activity || [];
  const isFreePlan = !userData?.subscription?.plan || userData?.subscription?.plan === 'free';
  const plan = userData?.subscription?.plan || 'free';


  const codingGymForm = useForm<z.infer<typeof codingGymSchema>>({
    resolver: zodResolver(codingGymSchema),
    defaultValues: {
      topics: "",
      difficulty: "easy",
      numQuestions: "3"
    },
  });

  async function onCodingGymSubmit(values: z.infer<typeof codingGymSchema>) {
    setIsCodingLoading(true);
    const params = new URLSearchParams({
        topics: values.topics,
        difficulty: values.difficulty,
        numQuestions: values.numQuestions,
    });
    router.push(`/dashboard/coding-quiz/instructions?${params.toString()}`);
  }

  const { questionsSolved, interviewsCompleted, recentQuizzes, averageScore, hasTakenQuiz, performanceData } = useMemo(() => {
    const quizzes = allActivity.filter(item => item.type === 'quiz') as QuizResult[];
    const interviews = allActivity.filter(item => item.type === 'interview') as InterviewActivity[];
    const completedQuizzes = quizzes.filter(item => item.analysis.length > 0);

    const solved = completedQuizzes.reduce((acc, quiz) => acc + quiz.quizState.length, 0);

    const totalScore = completedQuizzes.reduce((sum, quiz) => {
        const quizScore = quiz.analysis.reduce((s, a) => s + a.score, 0);
        return sum + (quizScore / Math.max(quiz.analysis.length, 1));
    }, 0);
    
    const avgScore = completedQuizzes.length > 0 ? Math.round((totalScore / completedQuizzes.length) * 100) : 0;
    
    const quizTaken = completedQuizzes.length > 0;
    
    const perfData = [...completedQuizzes]
        .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((result) => {
            const totalQuizScore = result.analysis.reduce((sum, item) => sum + item.score, 0);
            const averageQuizScore = Math.round((totalQuizScore / Math.max(result.analysis.length, 1)) * 100);
            return {
                name: format(new Date(result.timestamp), 'MMM d'),
                score: averageQuizScore,
            };
        });

    return {
        questionsSolved: solved,
        interviewsCompleted: interviews.length,
        recentQuizzes: quizzes.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        averageScore: avgScore,
        hasTakenQuiz: quizTaken,
        performanceData: perfData
    };
  }, [allActivity]);

  const planLimits = useMemo(() => {
    switch (plan) {
      case 'monthly':
        return { interviews: 20, quizzes: Infinity };
      case 'yearly':
        return { interviews: 300, quizzes: Infinity };
      default: // free
        return { interviews: 1, quizzes: 1 };
    }
  }, [plan]);

  const quizzesLeft = planLimits.quizzes === Infinity ? Infinity : planLimits.quizzes - (hasTakenQuiz ? 1: 0);

  const canTakeQuiz = isFreePlan ? !hasTakenQuiz : true;

  const planExpiresDays = useMemo(() => {
    if (userData?.subscription?.endDate) {
        const diff = differenceInDays(new Date(userData.subscription.endDate), new Date());
        return diff > 0 ? diff : 0;
    }
    return null;
  }, [userData]);


  const filteredQuizzes = useMemo(() => {
    return recentQuizzes.filter(quiz => 
        quiz.topics.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentQuizzes, searchQuery]);

  const getOverallScore = (analysis: QuizResult['analysis']) => {
    if (!analysis || analysis.length === 0) return 0;
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    return Math.round((totalScore / analysis.length) * 100);
  };

  const handleRetakeQuiz = (quiz: QuizResult) => {
     const params = new URLSearchParams({
        topics: quiz.topics,
        difficulty: quiz.difficulty,
        numQuestions: String(quiz.quizState.length),
    });
    router.push(`/dashboard/coding-quiz/instructions?${params.toString()}`);
  }

  const handleInfoClick = (quiz: QuizResult) => {
    setSelectedQuiz(quiz);
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Welcome, {user?.displayName || 'User'}!</h1>
        <p className="text-muted-foreground">Here's your progress overview, let's get started!</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewsCompleted} / {planLimits.interviews}</div>
            <p className="text-xs text-muted-foreground">This feature is coming soon!</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Coding Quizzes Taken</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{hasTakenQuiz ? 1 : 0} / {isFreePlan ? 1 : '∞'}</div>
             <p className="text-xs text-muted-foreground">
                {isFreePlan ? `${quizzesLeft === 0 ? '0' : '1'} quiz left.` : 'Unlimited quizzes.'}
             </p>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">Based on your performance</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan Expires</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {planExpiresDays !== null && userData?.subscription.plan !== 'free' ? (
                <>
                    <div className="text-2xl font-bold">{planExpiresDays} Days</div>
                    <p className="text-xs text-muted-foreground">left on your current plan.</p>
                </>
             ) : (
                <>
                    <div className="text-2xl font-bold">N/A</div>
                    <p className="text-xs text-muted-foreground">You are on the free plan.</p>
                </>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>
                    Your average quiz scores over time. Complete more quizzes to see your progress!
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pr-6">
                 {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                        data={performanceData}
                        margin={{
                            top: 5, right: 10, left: -10, bottom: 5,
                        }}
                        >
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} activeDot={{ r: 6, style: { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' } }} />
                        </AreaChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <BarChart className="w-12 h-12 mb-4" />
                        <p className="font-semibold">No performance data yet</p>
                        <p className="text-sm">Take a quiz to see your progress.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
        <Card className="flex flex-col">
          {!canTakeQuiz ? (
            <div className="flex flex-col h-full justify-center items-center text-center p-6">
                <div className="bg-accent/10 text-accent rounded-full p-3 mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Unlock Unlimited Practice</h3>
                <p className="text-muted-foreground mb-4">
                  You've used your free quiz attempt. Upgrade to Pro to solve unlimited coding questions and ace your interviews.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link href="/dashboard/pricing">
                    <Gem className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Link>
                </Button>
            </div>
          ) : (
            <Form {...codingGymForm}>
              <form onSubmit={codingGymForm.handleSubmit(onCodingGymSubmit)} className="flex flex-col h-full">
                <CardHeader>
                   <div className="flex items-center gap-3">
                     <div className="bg-secondary/20 text-secondary-foreground rounded-lg p-2"><Code className="h-6 w-6" /></div>
                     <div className="flex flex-col">
                         <CardTitle className="text-xl">Coding Gym</CardTitle>
                         <CardDescription>Start a new quiz.</CardDescription>
                     </div>
                 </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <FormField
                      control={codingGymForm.control}
                      name="topics"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topics</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., JavaScript, Algorithms" {...field}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={codingGymForm.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a difficulty" />
                                </SelectTrigger>
                              </FormControl>
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
                        control={codingGymForm.control}
                        name="numQuestions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Questions</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="# of Questions" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={isCodingLoading}>
                        {isCodingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Start Coding
                    </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Review your past coding quizzes and retake them to improve.</CardDescription>
            <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by topic or difficulty..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead className="hidden md:table-cell">Difficulty</TableHead>
                        <TableHead className="hidden md:table-cell text-center">Score</TableHead>
                        <TableHead className="hidden md:table-cell text-center">Result</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => (
                        <TableRow key={quiz.id} className="border-b-border/20">
                            <TableCell className="font-medium capitalize">{quiz.topics}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant={
                                    quiz.difficulty === 'easy' ? 'default' :
                                    quiz.difficulty === 'moderate' ? 'secondary' : 'destructive'
                                } className="capitalize">{quiz.difficulty}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center font-semibold">
                                {getOverallScore(quiz.analysis)}%
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                                <Button asChild variant="outline" size="sm" disabled={!quiz.analysis || quiz.analysis.length === 0}>
                                    <Link href={`/dashboard/coding-quiz/analysis?id=${quiz.id}`}>View</Link>
                                </Button>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => handleRetakeQuiz(quiz)}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Dialog onOpenChange={(open) => !open && setSelectedQuiz(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => handleInfoClick(quiz)}>
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                You haven't taken any quizzes yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {selectedQuiz && (
              <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="capitalize">{selectedQuiz.topics} Quiz Details</DialogTitle>
                    <DialogDescription>
                      Review the details of your past quiz attempt.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge variant={
                          selectedQuiz.difficulty === 'easy' ? 'default' :
                          selectedQuiz.difficulty === 'moderate' ? 'secondary' : 'destructive'
                      } className="capitalize">{selectedQuiz.difficulty}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-semibold">{getOverallScore(selectedQuiz.analysis)}%</span>
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-start gap-2">
                     <Button asChild variant="outline" disabled={!selectedQuiz.analysis || selectedQuiz.analysis.length === 0}>
                        <Link href={`/dashboard/coding-quiz/analysis?id=${selectedQuiz.id}`} onClick={() => setSelectedQuiz(null)}>View Full Analysis</Link>
                    </Button>
                    <Button onClick={() => { handleRetakeQuiz(selectedQuiz); setSelectedQuiz(null); }}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retake Quiz
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>

    </main>
  );
}

    