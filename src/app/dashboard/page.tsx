

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Code, Briefcase, Percent, Search, RefreshCw, BarChart, Info, CalendarDays, Loader2, Lock, Building, BrainCircuit, User, Gem, CheckCircle, BookOpen, PlayCircle, Star, Swords, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { StoredActivity, QuizResult, InterviewActivity, UserData, SyllabusDay } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { getUserData } from "@/lib/firebase-service";
import { differenceInDays, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";


const codingGymSchema = z.object({
  topics: z.string().min(1, "Topics are required."),
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

const FocusChecklistItem = ({ icon, text, isCompleted }: { icon: React.ElementType, text: string, isCompleted: boolean }) => (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/50", isCompleted && "opacity-50")}>
        {isCompleted ? 
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> :
            React.createElement(icon, { className: "h-5 w-5 text-primary flex-shrink-0" })
        }
        <p className={cn("font-medium text-foreground", isCompleted && "line-through text-muted-foreground")}>{text}</p>
    </div>
);

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
  
  const { questionsSolved, interviewsCompleted, recentQuizzes, averageScore, hasTakenQuiz, performanceData, completedDays, dailyTaskStatus } = useMemo(() => {
    const quizzes = allActivity.filter(item => item.type === 'quiz') as QuizResult[];
    const interviews = allActivity.filter(item => item.type === 'interview') as InterviewActivity[];
    const completedQuizzes = quizzes.filter(item => item.analysis.length > 0);
    const completedInterviews = interviews.filter(item => item.analysis && item.analysis.overallScore);

    const solved = completedQuizzes.reduce((acc, quiz) => acc + quiz.quizState.length, 0);

    const totalQuizScore = completedQuizzes.reduce((sum, quiz) => {
        const quizAvg = quiz.analysis.reduce((s, a) => s + a.score, 0) / Math.max(quiz.analysis.length, 1);
        return sum + quizAvg * 100;
    }, 0);

    const totalInterviewScore = completedInterviews.reduce((sum, interview) => sum + (interview.analysis?.overallScore || 0), 0);

    const totalActivities = completedQuizzes.length + completedInterviews.length;
    const totalScore = totalQuizScore + totalInterviewScore;
    
    const avgScore = totalActivities > 0 ? Math.round(totalScore / totalActivities) : 0;
    
    const quizTaken = completedQuizzes.length > 0;
    
    const allQuizSessions = allActivity
        .filter((a): a is QuizResult => a.type === 'quiz' && a.analysis && a.analysis.length > 0)
        .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const perfData = allQuizSessions.map((result, index) => {
        const score = result.analysis.reduce((sum, item) => sum + item.score, 0) / result.analysis.length * 100;
        return {
            name: `Quiz #${index + 1}`,
            score: Math.round(score),
        }
    });


    // Arena progress calculation
    const syllabus = userData?.syllabus || [];
    const activity = userData?.activity || [];
    const status: { [day: number]: { learn: boolean; quiz: boolean; interview: boolean; } } = {};

    syllabus.forEach(day => {
        status[day.day] = { learn: false, quiz: false, interview: false };
    });

    activity.forEach(act => {
        const actTopic = act.details.topic.toLowerCase();
        const day = syllabus.find(d => d.topic.toLowerCase().includes(actTopic) || actTopic.includes(d.topic.toLowerCase()));
        
        if (day) {
            if (act.type === 'note-generation') status[day.day].learn = true;
            if (act.type === 'quiz') status[day.day].quiz = true;
            if (act.type === 'interview') status[day.day].interview = true;
        }
    });

    let lastCompletedDay = 0;
    for (let i = 1; i <= syllabus.length; i++) {
        const dayStatus = status[i];
        if (!dayStatus) continue;
        const isFinalDay = i === 60;
        const interviewRequired = isFinalDay || ((i - 1) % 3 === 0);
        const learnRequired = !isFinalDay;
        const isDayComplete = dayStatus.quiz && (learnRequired ? dayStatus.learn : true) && (interviewRequired ? dayStatus.interview : true);

        if (isDayComplete) {
            lastCompletedDay = i;
        } else {
            break;
        }
    }

    return {
        questionsSolved: solved,
        interviewsCompleted: interviews.length,
        recentQuizzes: quizzes.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        averageScore: avgScore,
        hasTakenQuiz: quizTaken,
        performanceData: perfData,
        completedDays: lastCompletedDay,
        dailyTaskStatus: status,
    };
  }, [allActivity, userData]);
  
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
  
  const currentDayNumber = completedDays + 1;
  const currentDayData = userData?.syllabus?.find(d => d.day === currentDayNumber);
  const currentDayStatus = dailyTaskStatus[currentDayNumber] || { learn: false, quiz: false, interview: false };
  const isFinalDay = currentDayNumber === 60;
  const interviewIsScheduled = currentDayNumber === 1 || isFinalDay || (currentDayNumber - 1) % 3 === 0;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Welcome, {user?.displayName || 'User'}!</h1>
        <p className="text-muted-foreground">Here's your progress overview, let's get started!</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Card className="bg-blue-500/20 text-blue-950 dark:text-blue-200 border-blue-500/30 shadow-lg shadow-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewsCompleted}</div>
            <p className="text-xs text-blue-400/80">Practice makes perfect</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/20 text-orange-950 dark:text-orange-200 border-orange-500/30 shadow-lg shadow-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Coding Questions Solved</CardTitle>
            <Code className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{questionsSolved}</div>
             <p className="text-xs text-orange-400/80">Across all quizzes</p>
          </CardContent>
        </Card>
        <Card className="bg-pink-500/20 text-pink-950 dark:text-pink-200 border-pink-500/30 shadow-lg shadow-pink-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Percent className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-pink-400/80">Based on your performance</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/20 text-yellow-950 dark:text-yellow-200 border-yellow-500/30 shadow-lg shadow-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan Expires</CardTitle>
            <CalendarDays className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
             {planExpiresDays !== null && userData?.subscription.plan !== 'free' ? (
                <>
                    <div className="text-2xl font-bold">{planExpiresDays} Days</div>
                    <p className="text-xs text-yellow-400/80">left on your current plan.</p>
                </>
             ) : (
                <>
                    <div className="text-2xl font-bold">N/A</div>
                    <p className="text-xs text-yellow-400/80">You are on the free plan.</p>
                </>
             )}
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
              <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                  <CardDescription>
                      Your scores from all coding quizzes over time. Keep practicing to see your progress!
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
                          <p className="text-sm">Complete a quiz from the Arena to see your progress.</p>
                      </div>
                  )}
              </CardContent>
          </Card>
        </div>

        <div>
            <Card className="h-full flex flex-col">
                 <CardHeader>
                    <CardTitle>Today's Focus: Day {currentDayNumber}</CardTitle>
                    {currentDayData ? (
                        <CardDescription>Topic: <span className="font-semibold text-foreground">{currentDayData.topic}</span></CardDescription>
                    ) : (
                         <CardDescription>You've completed the Arena!</CardDescription>
                    )}
                </CardHeader>
                 <CardContent className="flex-grow space-y-3">
                    {currentDayData ? (
                        <>
                           {!isFinalDay && <FocusChecklistItem icon={BookOpen} text="Study Core Concepts" isCompleted={currentDayStatus.learn} />}
                           <FocusChecklistItem icon={Code} text="Take Code Izanami" isCompleted={currentDayStatus.quiz} />
                           {interviewIsScheduled && (
                                <FocusChecklistItem icon={Briefcase} text="Mock Interview" isCompleted={currentDayStatus.interview} />
                           )}
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                            <Star className="w-10 h-10 mb-4 text-yellow-500" />
                            <p className="font-semibold">Congratulations!</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                     <Button asChild className="w-full">
                        <Link href="/dashboard/arena">Go to Arena <ArrowRight className="ml-2 w-4 h-4"/></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Standard Quiz History</CardTitle>
            <CardDescription>Review your past standard quizzes and retake them to improve.</CardDescription>
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
                                You haven't taken any standard quizzes yet.
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

