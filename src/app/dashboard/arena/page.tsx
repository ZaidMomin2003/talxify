
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
                <CardTitle className="text-2xl font-bold">Your Plan Has Expired or Needs an Upgrade</CardTitle>
                <CardDescription>
                    To unlock the full 60-day Arena, the Resume Builder, and other powerful features, please upgrade or renew your Pro plan.
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
    const [dialogOpen, setDialogOpen] = useState<number | null>(null);

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

        // A map to quickly find a day by its topic, case-insensitive
        const dayTopicMap = new Map(syllabus.map(d => [d.topic.toLowerCase(), d.day]));

        activity.forEach(act => {
            const actTopic = act.details.topic.toLowerCase();
            let matchedDay = -1;

            // Direct topic match
            if (dayTopicMap.has(actTopic)) {
                matchedDay = dayTopicMap.get(actTopic)!;
            } else {
                 // Fallback for partial matches if needed, can be complex
                 // For now, we rely on exact topic matches for simplicity and reliability
                 if (act.type === 'interview') {
                     if (actTopic.includes('icebreaker') && dayTopicMap.has('icebreaker introduction')) matchedDay = dayTopicMap.get('icebreaker introduction')!;
                     if (actTopic.includes('final') && dayTopicMap.has('final comprehensive review')) matchedDay = dayTopicMap.get('final comprehensive review')!;
                 }
            }
            
            if (matchedDay !== -1 && status[matchedDay]) {
                 if (act.type === 'note-generation') status[matchedDay].learn = true;
                 if (act.type === 'quiz') status[matchedDay].quiz = true;
                 if (act.type === 'interview') {
                    const interviewAct = act as InterviewActivity;
                    // Check if feedback is still pending to determine 'in progress'
                    if (interviewAct.feedback === "Feedback will be generated on the results page.") {
                         status[matchedDay].isInterviewInProgress = true;
                    } else {
                        status[matchedDay].interview = true;
                    }
                    status[matchedDay].interviewId = interviewAct.id;
                 }
            }
        });

        let lastCompletedDay = 0;
        for (let i = 1; i <= syllabus.length; i++) {
            const dayStatus = status[i];
            if (!dayStatus) continue;

            const isFinalDay = i === 60;
            // Day 1 has a special interview, no 'learn' task
            const learnRequired = !isFinalDay;
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
        const topic = syllabus.find(d => d.day === day)?.topic;
        if (!topic) {
             console.error(`No topic found for day ${day}`);
             return;
        }

        if (type === 'learn') {
            router.push(`/dashboard/arena/notes?topic=${encodeURIComponent(topic)}`);
        } else if (type === 'quiz') {
            router.push(`/dashboard/coding-gym?topic=${encodeURIComponent(topic)}`);
        } else if (type === 'interview') {
            const meetingId = user!.uid + "_" + Date.now();
            const params = new URLSearchParams({ topic });
            router.push(`/dashboard/interview/${meetingId}/instructions?${params.toString()}`);
        }
        setDialogOpen(null);
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
    
    const { plan, endDate } = userData?.subscription || {};
    const isExpired = endDate ? new Date() > new Date(endDate) : false;
    const isFreePlan = !plan || plan === 'free' || isExpired;
    // Allow free users to access Day 1. If they have completed Day 1 (completedDays >= 1), they hit the paywall.
    const trialExpired = isFreePlan && completedDays >= 1;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-headline">
              <Swords className="h-8 w-8" /> 60-Day Interview Prep Arena
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
                    const isFinalDay = day.day === 60;
                    const learnRequired = !isFinalDay;
                    const interviewIsScheduled = isFinalDay || (day.day - 1) % 3 === 0;

                    return (
                        <Dialog key={day.day} open={dialogOpen === day.day} onOpenChange={(open) => setDialogOpen(open ? day.day : null)}>
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
                                    {learnRequired && (
                                        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                            {dayStatus.learn ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <BookOpen className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                                            <div className="flex-1">
                                                <p className="font-semibold text-foreground">Learn: {day.topic}</p>
                                                <p className="text-xs text-muted-foreground">Study the core concepts of today's topic.</p>
                                            </div>
                                            <Button size="sm" onClick={() => handleStartChallenge(day.day, 'learn')} disabled={!isUnlocked} className="w-24">
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
                                                <Button size="sm" disabled={!isUnlocked} className="w-24">
                                                    {dayStatus.quiz ? <><RefreshCw className="mr-2 h-4 w-4"/>Retake</> : isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                        <QuizStartDialog day={day.day} topic={day.topic} isFinalDay={isFinalDay} onStart={() => handleStartChallenge(day.day, 'quiz')} />
                                    </Dialog>
                                    {interviewIsScheduled && (
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                        {dayStatus.interview ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Briefcase className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">{day.day === 1 ? "Icebreaker Interview" : isFinalDay ? "Final Comprehensive Interview" : "Take a Mock Interview"}</p>
                                            <p className="text-xs text-muted-foreground">{day.day === 1 ? "A friendly chat to get to know you." : (isFinalDay ? "A 20-minute interview on all learned concepts." : "Practice your interview skills.")}</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                             {dayStatus.interview && (
                                                <Button asChild size="sm" variant="outline" className="w-24">
                                                    <Link href={`/dashboard/interview/${dayStatus.interviewId}/results`}>
                                                        <BarChart className="mr-2 h-4 w-4"/>Result
                                                    </Link>
                                                </Button>
                                             )}
                                             <Button size="sm" onClick={() => handleStartChallenge(day.day, 'interview')} disabled={!isUnlocked} className="w-24">
                                                {dayStatus.isInterviewInProgress 
                                                    ? <><History className="mr-2 h-4 w-4"/>Resume</>
                                                    : dayStatus.interview 
                                                        ? <><RefreshCw className="mr-2 h-4 w-4"/>Retake</>
                                                        : isUnlocked ? 'Start' : <Lock className="h-4 w-4" />
                                                }
                                            </Button>
                                        </div>
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

    