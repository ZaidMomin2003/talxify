
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription as DialogDescriptionComponent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Swords, Lock, PlayCircle, BookOpen, Code, Briefcase, CheckCircle, Loader2, Gem, Eye, RefreshCw, Trophy, History, ShieldQuestion, Target, BrainCircuit, BarChart, ArrowRight, Sparkles } from "lucide-react";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserData, getActivity } from '@/lib/firebase-service';
import type { SyllabusDay } from '@/ai/flows/generate-syllabus';
import type { StoredActivity, UserData, InterviewActivity, QuizResult, NoteGenerationActivity } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

function QuizStartDialog({ day, topic, isFinalDay, onStart }: { day: number, topic: string, isFinalDay: boolean, onStart: () => void }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                    <ShieldQuestion className="h-8 w-8 text-primary" />
                    Code Izanami: {isFinalDay ? "Final Exam" : topic}
                </DialogTitle>
                <DialogDescriptionComponent>
                    You are about to begin an adaptive coding challenge. Read the rules below before you start.
                </DialogDescriptionComponent>
            </DialogHeader>
            <div className="my-6 space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <Target className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                        <p className="font-semibold text-foreground">Adaptive Difficulty</p>
                        <p className="text-xs text-muted-foreground">The questions will get harder as you answer correctly, and easier if you struggle.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <Trophy className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                        <p className="font-semibold text-foreground">Winning Condition</p>
                        <p className="text-xs text-muted-foreground">The workout ends when you correctly answer two "difficult" questions in a row.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <BarChart className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                        <p className="font-semibold text-foreground">Instant Analysis</p>
                        <p className="text-xs text-muted-foreground">After each question, you'll get instant AI feedback on your code and the correct solution.</p>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={onStart} size="lg">
                    Begin Challenge <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}


export default function ArenaPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [syllabus, setSyllabus] = useState<SyllabusDay[]>([]);
    const [activity, setActivity] = useState<StoredActivity[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState<string | null>(null);
    const [dialogOpenDay, setDialogOpenDay] = useState<number | null>(null);

    const fetchSyllabusAndActivity = useCallback(async () => {
        if (user) {
            setIsLoading(true);
            try {
                const data = await getUserData(user.uid);
                setUserData(data);

                if (data?.syllabus && data.syllabus.length > 0) {
                    setSyllabus(data.syllabus);
                } else {
                    router.push('/onboarding');
                    return;
                }
                const userActivity = await getActivity(user.uid);
                setActivity(userActivity);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [user, router]);

    useEffect(() => {
        if (!user) {
            return;
        }
        fetchSyllabusAndActivity();
    }, [user, fetchSyllabusAndActivity]);
    
    const { completedDays, dailyTaskStatus } = useMemo(() => {
        const status: { [day: number]: { learn: boolean; quiz: boolean; interview: boolean; quizId?: string; interviewId?: string, isInterviewInProgress?: boolean; interviewAttempts: number } } = {};

        syllabus.forEach(day => {
            status[day.day] = { learn: false, quiz: false, interview: false, interviewAttempts: 0 };
        });
        
        const sortedActivity = [...activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        sortedActivity.forEach(act => {
            const actTopic = act.details.topic.toLowerCase();
            // Use find to match syllabus day based on topic inclusion
            const matchedDay = syllabus.find(d => {
                const syllabusTopic = d.topic.toLowerCase();
                // Special handling for icebreaker
                if (act.type === 'interview' && (act.details.topic.toLowerCase().includes('icebreaker') || syllabusTopic.includes('icebreaker'))) {
                    return d.day === 1;
                }
                return syllabusTopic.includes(actTopic) || actTopic.includes(syllabusTopic);
            });

            if (matchedDay && status[matchedDay.day]) {
                 if (act.type === 'note-generation') {
                    status[matchedDay.day].learn = true;
                 }
                 if (act.type === 'quiz' && !status[matchedDay.day].quiz) {
                    status[matchedDay.day].quiz = true;
                    status[matchedDay.day].quizId = act.id;
                 }
                 if (act.type === 'interview') {
                     status[matchedDay.day].interviewAttempts += 1;
                     const interviewAct = act as InterviewActivity;
                    // An interview is considered "in progress" if feedback hasn't been generated yet.
                    if (interviewAct.feedback === "Feedback has not been generated for this interview.") {
                        if(!status[matchedDay.day].isInterviewInProgress){
                            status[matchedDay.day].isInterviewInProgress = true;
                            status[matchedDay.day].interviewId = interviewAct.id;
                        }
                    } else {
                        // Once feedback is present, it's fully complete.
                        if(!status[matchedDay.day].interview){
                            status[matchedDay.day].interview = true;
                            status[matchedDay.day].interviewId = interviewAct.id;
                        }
                        status[matchedDay.day].isInterviewInProgress = false; // Ensure it's false if feedback is present
                    }
                 }
            }
        });

        let lastCompletedDay = 0;
        for (let i = 1; i <= syllabus.length; i++) {
            const dayStatus = status[i];
            if (!dayStatus) continue;

            const isFinalDay = i === 60;
            // Day 1's learn task is optional as it's an intro
            const learnRequired = !isFinalDay && i !== 1;
            // Every 3rd day, starting from Day 1, plus the final day has an interview
            const interviewRequired = isFinalDay || (i - 1) % 3 === 0;
            
            const isDayComplete = dayStatus.quiz && 
                                  (!learnRequired || dayStatus.learn) && 
                                  (!interviewRequired || dayStatus.interview);

            if (isDayComplete) {
                lastCompletedDay = i;
            } else {
                break;
            }
        }
        
        return { completedDays: lastCompletedDay, dailyTaskStatus: status };
    }, [syllabus, activity]);


    const handleStartChallenge = (day: number, type: 'learn' | 'quiz' | 'interview') => {
        setIsNavigating(`${day}-${type}`);
        const topic = syllabus.find(d => d.day === day)?.topic;
        if (!topic) {
             console.error(`No topic found for day ${day}`);
             setIsNavigating(null);
             return;
        }

        if (type === 'learn') {
            router.push(`/dashboard/arena/notes?topic=${encodeURIComponent(topic)}`);
        } else if (type === 'quiz') {
            router.push(`/dashboard/coding-gym?topic=${encodeURIComponent(topic)}`);
        } else if (type === 'interview') {
            const meetingId = user!.uid + "_" + Date.now();
            const topicForInterview = day === 1 ? 'Icebreaker Introduction' : topic;
            const params = new URLSearchParams({ topic: topicForInterview });
            
            const existingInterviewId = dailyTaskStatus[day]?.interviewId;
            if (dailyTaskStatus[day]?.isInterviewInProgress && existingInterviewId) {
                // If interview is in progress, navigate to results to await feedback
                router.push(`/dashboard/interview/${existingInterviewId}/results`);
            } else {
                // Otherwise, start a new one
                router.push(`/dashboard/interview/${meetingId}/instructions?${params.toString()}`);
            }
        }
    }

    if (isLoading) {
        return (
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold">Loading Your Arena</h2>
                <p className="max-w-md text-muted-foreground">Preparing your personalized 60-day challenge...</p>
            </div>
          </div>
        );
    }
    
    const neonColors = [
        'border-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40',
        'border-green-500 shadow-green-500/20 hover:shadow-green-500/40',
        'border-yellow-500 shadow-yellow-500/20 hover:shadow-yellow-500/40',
        'border-red-500 shadow-red-500/20 hover:shadow-red-500/40',
        'border-purple-500 shadow-purple-500/20 hover:shadow-purple-500/40',
        'border-pink-500 shadow-pink-500/20 hover:shadow-pink-500/40',
    ];

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-blue-500/80 to-purple-600/80 p-8 text-center text-primary-foreground shadow-2xl">
          <div className="absolute inset-0 bg-dot-pattern opacity-20"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-4 w-fit rounded-full bg-white/20 p-4">
              <Swords className="h-10 w-10" />
            </div>
            <h1 className="font-headline text-4xl font-bold">
              60-Day Interview Prep Arena
            </h1>
            <p className="mt-2 text-lg text-primary-foreground/80">
              Complete daily tasks based on your personalized syllabus to sharpen your skills. Complete one day to unlock the next.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {syllabus.map((day, index) => {
                const isUnlocked = day.day <= completedDays + 1;
                const isCompleted = day.day <= completedDays;
                const dayStatus = dailyTaskStatus[day.day] || { learn: false, quiz: false, interview: false, interviewAttempts: 0 };
                const isFinalDay = day.day === 60;
                const learnRequired = !isFinalDay && day.day !== 1;
                const interviewIsScheduled = isFinalDay || (day.day - 1) % 3 === 0;

                return (
                    <Dialog key={day.day} open={dialogOpenDay === day.day} onOpenChange={(open) => !open && setDialogOpenDay(null)}>
                        <DialogTrigger asChild>
                            <div role="button" onClick={() => setDialogOpenDay(day.day)} className="h-full">
                                <Card 
                                    className={cn(
                                        "text-center transition-all duration-300 transform h-full flex flex-col cursor-pointer",
                                        "hover:-translate-y-1",
                                        interviewIsScheduled ? neonColors[index % neonColors.length] : 'hover:shadow-primary/20',
                                        !isUnlocked && "bg-muted/50 text-muted-foreground hover:shadow-none hover:border-border",
                                        isCompleted && "bg-green-500/10 border-green-500/50"
                                    )}
                                >
                                    <CardHeader className="flex-1">
                                        <CardTitle className="flex flex-col items-center gap-2">
                                            {isFinalDay ? <Trophy className="h-6 w-6 mb-2 text-yellow-500" /> : !isUnlocked && <Lock className="h-6 w-6 mb-2" />}
                                            Day {day.day}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs font-semibold text-primary truncate" title={day.topic}>{day.topic}</p>
                                        {isCompleted ? (
                                            <div className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-green-600">
                                                <CheckCircle className="h-4 w-4"/> Completed
                                            </div>
                                        ) : (
                                            <p className="text-sm font-semibold mt-2">{isUnlocked ? (isFinalDay ? 'Final Challenge' : 'Start Challenge') : 'Locked'}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                 <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    {isFinalDay && <Trophy className="h-6 w-6 text-yellow-500" />}
                                    Day {day.day}: {day.topic}
                                 </DialogTitle>
                                <DialogDescriptionComponent>
                                    {isUnlocked ? day.description : "You need to complete all previous challenges before you can unlock this day. Keep going!"}
                                </DialogDescriptionComponent>
                            </DialogHeader>
                            <div className="my-6 space-y-4">
                                {learnRequired && (
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                        {dayStatus.learn ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <BookOpen className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">Learn: {day.topic}</p>
                                            <p className="text-xs text-muted-foreground">Study the core concepts of today's topic.</p>
                                        </div>
                                        <Button onClick={() => handleStartChallenge(day.day, 'learn')} disabled={!isUnlocked || !!isNavigating} className="w-28">
                                            {isNavigating === `${day.day}-learn` ? <Loader2 className="animate-spin" /> : dayStatus.learn ? <><Eye className="mr-2 h-4 w-4"/>View</> : isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                )}
                                <Dialog>
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                        {dayStatus.quiz ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Code className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">{isFinalDay ? "Code Izanami: Final Exam" : "Code Izanami"}</p>
                                            <p className="text-xs text-muted-foreground">{isFinalDay ? "Adaptive quiz on all topics." : `Master ${day.topic}.`}</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {dayStatus.quiz && dayStatus.quizId && (
                                                <Button asChild variant="outline" className="w-28">
                                                    <Link href={`/dashboard/coding-quiz/analysis?id=${dayStatus.quizId}`}>
                                                        <BarChart className="mr-2 h-4 w-4"/>Result
                                                    </Link>
                                                </Button>
                                            )}
                                            <DialogTrigger asChild>
                                                <Button disabled={!isUnlocked || !!isNavigating} className="w-28">
                                                    {isNavigating === `${day.day}-quiz` ? <Loader2 className="animate-spin" /> : dayStatus.quiz ? <><RefreshCw className="mr-2 h-4 w-4"/>Retake</> : isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                    </div>
                                    <QuizStartDialog day={day.day} topic={day.topic} isFinalDay={isFinalDay} onStart={() => handleStartChallenge(day.day, 'quiz')} />
                                </Dialog>
                                {interviewIsScheduled && (
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                    {(dayStatus.interview || dayStatus.isInterviewInProgress) ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Briefcase className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">{day.day === 1 ? "Icebreaker Interview" : isFinalDay ? "Final Comprehensive Interview" : "Take a Mock Interview"}</p>
                                        <p className="text-xs text-muted-foreground">{day.day === 1 ? "A friendly chat to get to know you." : (isFinalDay ? "A 20-minute interview on all learned concepts." : "Practice your interview skills.")}</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                         {(dayStatus.interview || dayStatus.isInterviewInProgress) && dayStatus.interviewId && (
                                            <Button asChild variant="outline" className="w-28">
                                                <Link href={`/dashboard/interview/${dayStatus.interviewId}/results`}>
                                                    <BarChart className="mr-2 h-4 w-4"/>Result
                                                </Link>
                                            </Button>
                                         )}
                                         
                                         <Button onClick={() => handleStartChallenge(day.day, 'interview')} disabled={!isUnlocked || !!isNavigating} className="w-28">
                                            {isNavigating === `${day.day}-interview` ? <Loader2 className="animate-spin" /> : 
                                                (dayStatus.interview || dayStatus.interviewAttempts > 0) ? <><RefreshCw className="mr-2 h-4 w-4"/>Retake</> : 
                                                isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            })}
        </div>
      </div>
    </main>
  );
}
