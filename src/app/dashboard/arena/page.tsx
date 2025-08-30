
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription as DialogDescriptionComponent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Swords, Lock, PlayCircle, BookOpen, Code, Briefcase, CheckCircle, Loader2, Gem, Eye, RefreshCw, Trophy, History, ShieldQuestion, Target, BrainCircuit, BarChart, ArrowRight } from "lucide-react";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserData, getActivity } from '@/lib/firebase-service';
import type { SyllabusDay } from '@/ai/flows/generate-syllabus';
import type { StoredActivity, UserData, InterviewActivity, QuizResult, NoteGenerationActivity } from '@/lib/types';
import Link from 'next/link';

function UpgradeCard() {
    return (
        <Card className="col-span-full text-center bg-primary/5 border-primary/20 shadow-lg">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                    <Gem className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold">You've Completed Your Free Trial!</CardTitle>
                <CardDescription>
                    Congratulations on finishing Day 1. Upgrade to Pro to unlock the full 30-day Arena, the Resume Builder, and more powerful features.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg">
                    <Link href="/dashboard/pricing">Upgrade to Pro</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

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
                    <BrainCircuit className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                        <p className="font-semibold text-foreground">10 Question Limit</p>
                        <p className="text-xs text-muted-foreground">The workout consists of 10 questions to test your mastery of the topic.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <BarChart className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
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
        const status: { [day: number]: { learn: boolean; quiz: boolean; interview: boolean; interviewId?: string, isInterviewInProgress?: boolean } } = {};

        syllabus.forEach(day => {
            status[day.day] = { learn: false, quiz: false, interview: false };
        });

        activity.forEach(act => {
            // More robust topic matching
            const actTopic = act.details.topic.toLowerCase();
            const day = syllabus.find(d => {
                const dayTopic = d.topic.toLowerCase();
                // Special case for Day 1 icebreaker
                if (d.day === 1 && (actTopic.includes('icebreaker') || actTopic.includes('introduction'))) {
                    return true;
                }
                return dayTopic.includes(actTopic) || actTopic.includes(dayTopic);
            });
            
            if (day) {
                if (act.type === 'note-generation') status[day.day].learn = true;
                if (act.type === 'quiz') status[day.day].quiz = true;
                if (act.type === 'interview') {
                    // Check if feedback is pending, which means it might be in progress
                    const interviewAct = act as InterviewActivity;
                    if (interviewAct.feedback === "Feedback will be generated on the results page.") {
                         status[day.day].isInterviewInProgress = true;
                    } else {
                        status[day.day].interview = true;
                    }
                    status[day.day].interviewId = interviewAct.id;
                }
            }
        });

        let lastCompletedDay = 0;
        for (let i = 1; i <= syllabus.length; i++) {
            const dayStatus = status[i];
            if (!dayStatus) continue;

            const isDay30 = i === 30;
            const learnRequired = !isDay30;
            const interviewRequired = isDay30 || (i % 2 !== 0);
            
            const isDayComplete = dayStatus.quiz && (!learnRequired || dayStatus.learn) && (!interviewRequired || dayStatus.interview);

            if (isDayComplete) {
                lastCompletedDay = i;
            } else {
                break;
            }
        }
        
        return { completedDays: lastCompletedDay, dailyTaskStatus: status };
    }, [syllabus, activity]);


    const handleStartChallenge = (day: number, type: 'learn' | 'quiz' | 'interview') => {
        const topic = syllabus.find(d => d.day === day)?.topic || 'JavaScript';
        const isDay30 = day === 30;

        if (type === 'learn') {
            router.push(`/dashboard/arena/notes?topic=${encodeURIComponent(topic)}`);
        } else if (type === 'quiz') {
            const quizTopic = isDay30 ? syllabus.slice(0, 29).map(d => d.topic).join(', ') : topic;
            router.push(`/dashboard/coding-gym?topic=${encodeURIComponent(quizTopic)}`);
        } else if (type === 'interview') {
            const isDay1 = day === 1;
            const interviewTopic = isDay1 ? 'Icebreaker Introduction' : (isDay30 ? 'Final Comprehensive Review' : topic);
            const meetingId = user!.uid + "_" + Date.now();
            const params = new URLSearchParams({ topic: interviewTopic });
            router.push(`/dashboard/interview/${meetingId}/instructions?${params.toString()}`);
        }
    }

    if (isLoading) {
        return (
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold">Loading Your Arena</h2>
                <p className="max-w-md text-muted-foreground">Preparing your personalized 30-day challenge...</p>
            </div>
          </div>
        );
    }
    
    const isFreePlan = !userData?.subscription?.plan || userData.subscription.plan === 'free';
    const trialExpired = isFreePlan && completedDays >= 1;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-headline">
              <Swords className="h-8 w-8" /> 30-Day Interview Prep Arena
            </CardTitle>
            <CardDescription>
              Complete daily tasks based on your personalized syllabus to sharpen your skills. Complete one day to unlock the next.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {trialExpired ? (
                <UpgradeCard />
            ) : (
                syllabus.map((day) => {
                    const isUnlocked = day.day <= completedDays + 1;
                    const isCompleted = day.day <= completedDays;
                    const dayStatus = dailyTaskStatus[day.day] || { learn: false, quiz: false, interview: false };
                    const isFinalDay = day.day === 30;

                    return (
                        <Dialog key={day.day}>
                            <DialogTrigger asChild>
                                <Card 
                                    className={cn(
                                        "text-center transition-all duration-300 transform cursor-pointer",
                                        "hover:-translate-y-1 hover:shadow-primary/20 hover:border-primary/50",
                                        !isUnlocked && "bg-muted/50 text-muted-foreground hover:shadow-none hover:border-border",
                                        isCompleted && "bg-green-500/10 border-green-500/50"
                                    )}
                                >
                                    <CardHeader>
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
                                    {!isFinalDay && (
                                        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                            {dayStatus.learn ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <BookOpen className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                                            <div className="flex-1">
                                                <p className="font-semibold text-foreground">Learn: {day.topic}</p>
                                                <p className="text-xs text-muted-foreground">Study the core concepts of today's topic.</p>
                                            </div>
                                            <Button size="sm" onClick={() => handleStartChallenge(day.day, 'learn')} disabled={!isUnlocked}>
                                                {dayStatus.learn ? <><Eye className="mr-2 h-4 w-4"/>View</> : isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
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
                                             <DialogTrigger asChild>
                                                <Button size="sm" disabled={!isUnlocked}>
                                                    {dayStatus.quiz ? <><RefreshCw className="mr-2 h-4 w-4"/>Retake</> : isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                        <QuizStartDialog day={day.day} topic={day.topic} isFinalDay={isFinalDay} onStart={() => handleStartChallenge(day.day, 'quiz')} />
                                    </Dialog>
                                    {(day.day % 2 !== 0 || isFinalDay) && (
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                        {dayStatus.interview ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Briefcase className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">{day.day === 1 ? "Icebreaker Interview" : isFinalDay ? "Final Comprehensive Interview" : "Take a Mock Interview"}</p>
                                            <p className="text-xs text-muted-foreground">{day.day === 1 ? "A friendly chat to get to know you." : (isFinalDay ? "A 20-minute interview on all learned concepts." : "Practice your interview skills.")}</p>
                                        </div>
                                         <Button size="sm" onClick={() => handleStartChallenge(day.day, 'interview')} disabled={!isUnlocked}>
                                            {dayStatus.isInterviewInProgress 
                                                ? <><History className="mr-2 h-4 w-4"/>Resume</>
                                                : dayStatus.interview 
                                                    ? <><RefreshCw className="mr-2 h-4 w-4"/>Retake</>
                                                    : isUnlocked ? 'Start' : <Lock className="h-4 w-4" />
                                            }
                                        </Button>
                                    </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    );
                })
            )}
        </div>
      </div>
    </main>
  );
}
