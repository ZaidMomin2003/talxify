

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Code, Briefcase, Percent, Search, RefreshCw, BarChart, Info, CalendarDays, Loader2, Lock, Building, BrainCircuit, User, Gem, CheckCircle, BookOpen, PlayCircle, Star, Swords, ArrowRight, ArrowUpRight, MessageSquare, Wand2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { StoredActivity, QuizResult, InterviewActivity, UserData, SyllabusDay, InterviewQuestionSetActivity, SubscriptionPlan } from "@/lib/types";
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

const getOverallScore = (analysis: QuizResult['analysis']) => {
  if (!analysis || analysis.length === 0) return 0;
  const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
  return Math.round((totalScore / analysis.length) * 100);
};

const LevelUpToolCard = ({ href, icon: Icon, title, description }: { href: string; icon: React.ElementType; title: string; description: string }) => (
  <Link href={href} className="group block">
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
      <div className="bg-primary/5 text-primary p-2.5 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/10">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 group-hover:text-foreground/70 transition-colors uppercase tracking-widest font-bold text-[9px]">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground/30 ml-auto self-center group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
    </div>
  </Link>
);

const freePlanLimits: Record<string, number> = {
  interviews: 1,
  codingQuizzes: 1,
  notes: 1,
  questionSets: 1,
  aiEnhancements: 2,
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


  const {
    questionsSolved,
    interviewsCompleted,
    recentQuizzes,
    averageScore,
    hasTakenQuiz,
    performanceData,
    completedDays,
    dailyTaskStatus,
    interviewQuestionsGenerated,
    interviewUsage,
    notesGenerated,
    quizzesTaken,
    aiEnhancementsUsed
  } = useMemo(() => {
    const quizzes = allActivity.filter(item => item.type === 'quiz') as QuizResult[];
    const interviews = allActivity.filter(item => item.type === 'interview') as InterviewActivity[];
    const questionSets = allActivity.filter(item => item.type === 'interview-question-set') as InterviewQuestionSetActivity[];
    const notes = allActivity.filter(item => item.type === 'note-generation');

    const completedQuizzes = quizzes.filter(item => item.analysis.length > 0);
    const completedInterviews = interviews.filter(item => item.analysis && item.analysis.crackingChance !== undefined);

    const solved = quizzes.reduce((acc, quiz) => acc + quiz.quizState.length, 0);

    const totalQuizScore = completedQuizzes.reduce((sum, quiz) => {
      const quizAvg = quiz.analysis.reduce((s, a) => s + a.score, 0) / Math.max(quiz.analysis.length, 1);
      return sum + quizAvg * 100;
    }, 0);

    const totalInterviewScore = completedInterviews.reduce((sum, interview) => sum + (interview.analysis?.crackingChance || 0), 0);

    const questionsGenerated = questionSets.reduce((acc, set) => acc + set.questions.questions.length, 0);

    const totalActivities = completedQuizzes.length + completedInterviews.length;
    const totalScore = totalQuizScore + totalInterviewScore;

    const avgScore = totalActivities > 0 ? Math.round(totalScore / totalActivities) : 0;

    const quizTaken = completedQuizzes.length > 0;

    const allSessions = [
      ...completedInterviews.map(i => ({ type: 'Interview', timestamp: i.timestamp, score: i.analysis!.crackingChance }))
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const perfData = allSessions.map((session, index) => ({
      name: `${session.type} #${index + 1}`,
      score: session.score,
    }));


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

    const currentPlan = userData?.subscription?.plan || 'free';

    let interviewLimit: number;
    let interviewCount = interviews.length;

    if (currentPlan.startsWith('pro')) {
      interviewLimit = userData?.subscription?.interviewUsage?.limit || 0;
    } else {
      interviewLimit = freePlanLimits.interviews;
    }


    return {
      questionsSolved: solved,
      interviewsCompleted: interviews.length,
      recentQuizzes: quizzes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      averageScore: avgScore,
      hasTakenQuiz: quizTaken,
      performanceData: perfData,
      completedDays: lastCompletedDay,
      dailyTaskStatus: status,
      interviewQuestionsGenerated: questionsGenerated,
      interviewUsage: {
        count: interviewCount,
        limit: interviewLimit,
        isPro: currentPlan.startsWith('pro'),
      },
      notesGenerated: notes.length,
      quizzesTaken: quizzes.length,
      aiEnhancementsUsed: userData?.subscription?.usage?.aiEnhancements || 0,
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
    <main className="flex-1 p-4 sm:p-6 relative overflow-x-hidden min-h-screen">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-dot-pattern opacity-[0.02]" />
      <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mb-10 relative">
        <h1 className="font-headline text-4xl font-black tracking-tight text-foreground">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}
        </h1>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Total Interviews",
            count: interviewsCompleted,
            bgColor: "bg-[#ffcd52]",
            label: "RECORDS"
          },
          {
            title: "Avg. Performance",
            count: `${averageScore}%`,
            bgColor: "bg-[#b8a2ff]",
            label: "SCORE"
          },
          {
            title: "AI Study Notes",
            count: notesGenerated,
            limit: userData?.subscription?.plan.startsWith('pro') ? '∞' : freePlanLimits.notes,
            bgColor: "bg-[#c4f068]",
            label: "KNOWLEDGE"
          },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "relative h-[240px] rounded-[32px] overflow-hidden transition-all duration-500 group shadow-lg",
            stat.bgColor
          )}>
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-8 h-full flex flex-col justify-between relative z-10">
              {/* Title Section */}
              <div>
                <h3 className="text-black font-black text-xl tracking-tight leading-tight">
                  {stat.title}
                </h3>
              </div>

              {/* Value Section */}
              <div>
                <div className="text-black/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  {stat.label}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-black font-black text-6xl tracking-tighter">
                    {stat.count}
                  </span>
                  {stat.limit && (
                    <span className="text-black/20 font-black text-2xl tracking-tighter">
                      / {stat.limit}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-black flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-xl">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2">
          <Card className="h-full border-primary/10 bg-muted/20 backdrop-blur-sm overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[100px] -ml-24 -mb-24" />
            <CardHeader className="relative z-10 p-8 pb-0">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-inner">
                  <BarChart className="h-6 w-6" />
                </div>
                Performance Analytics
              </CardTitle>
              <CardDescription className="text-base font-medium opacity-70">
                AI-driven analysis of your technical progression.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] w-full pr-6 pt-4">
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
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      fontWeight="bold"
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      fontWeight="bold"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <RechartsTooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      animationDuration={1500}
                      activeDot={{ r: 6, style: { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 } }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-background/30 rounded-2xl border border-dashed border-muted-foreground/20">
                  <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold text-foreground/80">No Analytics Available</p>
                  <p className="text-sm max-w-[200px]">Complete your first AI assessment to unlock readiness insights.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full border-primary/10 bg-muted/20 backdrop-blur-md relative overflow-hidden shadow-2xl flex flex-col">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px]" />
            <CardHeader className="p-8 pb-4 relative z-10">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary shadow-lg shadow-primary/25 text-primary-foreground">
                  <Wand2 className="w-6 h-6" />
                </div>
                AI Toolkit
              </CardTitle>
              <CardDescription className="text-base font-medium opacity-70">Specialized labs for career growth.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 p-8 pt-0 relative z-10">
              <LevelUpToolCard href="/dashboard/coding-practice" icon={Code} title="Coding Labs" description="Algorithm drills & trials" />
              <LevelUpToolCard href="/dashboard/interview-questions-generator" icon={MessageSquare} title="Q&A Engine" description="Tech stack deep dives" />
              <LevelUpToolCard href="/dashboard/notes-generator" icon={BookOpen} title="Genius Notes" description="Topic cheat sheets" />
              <LevelUpToolCard href="/dashboard/levelup-interview" icon={Briefcase} title="Live Arena" description="Simulated assessments" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card className="border-primary/5 bg-muted/20 backdrop-blur-sm overflow-hidden shadow-2xl rounded-[2rem] relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mt-32" />
          <CardHeader className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black tracking-tight">Standard Quiz History</CardTitle>
                <CardDescription className="font-medium opacity-70">Review and retake your previous technical assessments.</CardDescription>
              </div>
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search by topic..."
                  className="pl-10 bg-background/50 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-2xl h-11 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0 relative z-10">
            <div className="rounded-[1.5rem] border border-muted-foreground/10 bg-background/40 overflow-hidden shadow-inner">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-6">Topic / Concept</TableHead>
                    <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-[0.2em] py-5">Level</TableHead>
                    <TableHead className="hidden md:table-cell text-center text-[10px] font-black uppercase tracking-[0.2em] py-5">Proficiency</TableHead>
                    <TableHead className="hidden md:table-cell text-center text-[10px] font-black uppercase tracking-[0.2em] py-5">Analysis</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] py-5 px-6">Retry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="group border-b-border/5 hover:bg-primary/5 transition-all duration-300">
                      <TableCell className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-base capitalize group-hover:text-primary transition-colors">{quiz.topics}</span>
                          <span className="text-[10px] text-muted-foreground md:hidden mt-1 font-black uppercase tracking-widest">{quiz.difficulty} • {getOverallScore(quiz.analysis)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-5">
                        <Badge variant="outline" className={cn(
                          "capitalize border-none py-1 h-6 px-3 text-[10px] font-black tracking-widest",
                          quiz.difficulty === 'easy' ? 'bg-green-500/10 text-green-600' :
                            quiz.difficulty === 'moderate' ? 'bg-orange-500/10 text-orange-600' : 'bg-red-500/10 text-red-600'
                        )}>{quiz.difficulty}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center py-5">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-background/50 border border-muted-foreground/10 text-xs font-black shadow-sm group-hover:border-primary/20 transition-colors">
                          {getOverallScore(quiz.analysis)}%
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center py-5">
                        <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl hover:bg-primary hover:text-white transition-all font-bold text-xs" disabled={!quiz.analysis || quiz.analysis.length === 0}>
                          <Link href={`/dashboard/coding-quiz/analysis?id=${quiz.id}`}>View Insight</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right py-5 px-6">
                        <Button variant="ghost" size="icon" className="hidden md:inline-flex h-9 w-9 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm" onClick={() => handleRetakeQuiz(quiz)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => handleInfoClick(quiz)}>
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Search className="h-12 w-12" />
                          <p className="font-black uppercase tracking-[0.2em] text-sm">No History Found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
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
    </main>
  );
}
