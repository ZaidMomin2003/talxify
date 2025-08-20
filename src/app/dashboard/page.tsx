
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


const codingGymSchema = z.object({
  topics: z.string().min(1, "Topics are required."),
  difficulty: z.enum(["easy", "moderate", "difficult"]),
  numQuestions: z.string(),
});

const mockInterviewSchema = z.object({
  targetCompany: z.string().min(1, "Target company is required."),
  targetRole: z.string().min(1, "Target role is required."),
  interviewType: z.enum(["technical", "behavioural"]),
});

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isCodingLoading, setIsCodingLoading] = useState(false);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
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

  const mockInterviewForm = useForm<z.infer<typeof mockInterviewSchema>>({
    resolver: zodResolver(mockInterviewSchema),
    defaultValues: {
      targetCompany: "",
      targetRole: "",
      interviewType: "technical",
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

  async function onMockInterviewSubmit(values: z.infer<typeof mockInterviewSchema>) {
    setIsInterviewLoading(true);

    const params = new URLSearchParams({
        company: values.targetCompany,
        role: values.targetRole,
        type: values.interviewType,
    });
    router.push(`/dashboard/mock-interview/instructions?${params.toString()}`);
  }

  const { questionsSolved, interviewsCompleted, recentQuizzes, averageScore, hasTakenQuiz } = useMemo(() => {
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

    return {
        questionsSolved: solved,
        interviewsCompleted: interviews.length,
        recentQuizzes: quizzes.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        averageScore: avgScore,
        hasTakenQuiz: quizTaken
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

  const interviewsLeft = planLimits.interviews - interviewsCompleted;
  const quizzesLeft = planLimits.quizzes === Infinity ? Infinity : planLimits.quizzes - (hasTakenQuiz ? 1: 0);

  const canTakeInterview = isFreePlan ? interviewsCompleted < 1 : true;
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
        <h1 className="font-headline text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Here's your progress overview, welcome back!</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Card className="bg-card border-none shadow-neumorphic">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewsCompleted} / {planLimits.interviews}</div>
            <p className="text-xs text-muted-foreground">{interviewsLeft} interviews left this cycle.</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-neumorphic">
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
        <Card className="bg-card border-none shadow-neumorphic">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">Based on your performance</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-neumorphic">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col border-none shadow-neumorphic hover:shadow-neumorphic-sm transition-shadow duration-300">
          <Form {...mockInterviewForm}>
            <form onSubmit={mockInterviewForm.handleSubmit(onMockInterviewSubmit)} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mock Interview</CardTitle>
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <CardDescription>Simulate a real-time interview with an AI.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={mockInterviewForm.control}
                    name="targetCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Company</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Google, Amazon" {...field} className="bg-background shadow-neumorphic-sm-inset"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={mockInterviewForm.control}
                    name="targetRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Frontend Developer" {...field} className="bg-background shadow-neumorphic-sm-inset"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={mockInterviewForm.control}
                  name="interviewType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Interview Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="technical" />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center gap-2">
                              <BrainCircuit className="w-4 h-4" /> Technical
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="behavioural" />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center gap-2">
                              <User className="w-4 h-4" /> Behavioural
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                  <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <Button type="submit" size="lg" className="w-full" disabled={isInterviewLoading || !canTakeInterview}>
                                {isInterviewLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {!canTakeInterview && <Lock className="mr-2 h-4 w-4" />}
                                Start Interview
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!canTakeInterview && (
                           <TooltipContent>
                            <p>Upgrade to Pro to take more interviews.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="flex flex-col border-none shadow-neumorphic hover:shadow-neumorphic-sm transition-shadow duration-300">
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
                  <div className="flex items-center justify-between">
                    <CardTitle>Coding Gym</CardTitle>
                    <Code className="h-6 w-6 text-accent" />
                  </div>
                  <CardDescription>Get AI-powered help with your coding problems.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <FormField
                      control={codingGymForm.control}
                      name="topics"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topics</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., JavaScript, Algorithms" {...field} className="bg-background shadow-neumorphic-sm-inset"/>
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
                                <SelectTrigger className="bg-card shadow-neumorphic-sm">
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
                                <SelectTrigger className="bg-card shadow-neumorphic-sm">
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
        <Card className="shadow-neumorphic border-none">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Review your past coding quizzes and retake them to improve.</CardDescription>
            <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by topic or difficulty..." 
                    className="pl-10 bg-background shadow-neumorphic-sm-inset"
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

    

    


