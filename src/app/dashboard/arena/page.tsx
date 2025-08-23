
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription as DialogDescriptionComponent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Swords, Lock, PlayCircle, BookOpen, Code, Briefcase, CheckCircle, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserData, getActivity } from '@/lib/firebase-service';
import type { SyllabusDay } from '@/ai/flows/generate-syllabus';
import type { StoredActivity } from '@/lib/types';

export default function ArenaPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [syllabus, setSyllabus] = useState<SyllabusDay[]>([]);
    const [activity, setActivity] = useState<StoredActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSyllabusAndActivity = useCallback(async () => {
        if (user) {
            setIsLoading(true);
            try {
                const userData = await getUserData(user.uid);
                if (userData?.syllabus && userData.syllabus.length > 0) {
                    setSyllabus(userData.syllabus);
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
        fetchSyllabusAndActivity();
    }, [fetchSyllabusAndActivity]);
    
    const { completedDays, dailyTaskStatus } = useMemo(() => {
        const topics = syllabus.map(day => day.topic.toLowerCase());
        const status: { [day: number]: { learn: boolean; quiz: boolean; interview: boolean; } } = {};
        
        activity.forEach(act => {
            const actTopic = act.details.topic.toLowerCase();
            const dayIndex = topics.findIndex(t => t.includes(actTopic) || actTopic.includes(t));

            if (dayIndex !== -1) {
                const day = dayIndex + 1;
                if (!status[day]) {
                    status[day] = { learn: false, quiz: false, interview: false };
                }
                if (act.type === 'note-generation') status[day].learn = true;
                if (act.type === 'quiz') status[day].quiz = true;
                if (act.type === 'interview') status[day].interview = true;
            }
        });

        let completedCount = 0;
        for (let i = 1; i <= syllabus.length; i++) {
            if (status[i] && status[i].learn && status[i].quiz && status[i].interview) {
                completedCount = i;
            } else {
                break;
            }
        }
        
        return { completedDays: completedCount, dailyTaskStatus: status };
    }, [syllabus, activity]);


    const handleStartChallenge = (day: number, type: 'learn' | 'quiz' | 'interview') => {
        const topic = syllabus.find(d => d.day === day)?.topic || 'JavaScript';
        
        if (type === 'learn') {
            router.push(`/dashboard/arena/notes?topic=${encodeURIComponent(topic)}`);
        } else if (type === 'quiz') {
            router.push(`/dashboard/coding-quiz/instructions?topics=${encodeURIComponent(topic)}&difficulty=easy&numQuestions=3`);
        } else if (type === 'interview') {
            router.push(`/dashboard/interview/setup?topic=${encodeURIComponent(topic)}`);
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
            {syllabus.map((day) => {
                const isUnlocked = day.day <= completedDays + 1;
                const isCompleted = day.day <= completedDays;
                const dayStatus = dailyTaskStatus[day.day] || { learn: false, quiz: false, interview: false };

                return (
                     <Dialog key={day.day}>
                        <DialogTrigger asChild>
                             <Card 
                                className={cn(
                                    "text-center transition-all duration-300 transform cursor-pointer",
                                    !isUnlocked && "bg-muted/50 text-muted-foreground hover:shadow-none hover:border-border",
                                    isUnlocked && "hover:-translate-y-1 hover:shadow-primary/20 hover:border-primary/50",
                                    isCompleted && "bg-green-500/10 border-green-500/50"
                                )}
                            >
                                <CardHeader>
                                    <CardTitle className="flex flex-col items-center gap-2">
                                        {!isUnlocked && <Lock className="h-6 w-6 mb-2" />}
                                        Day {day.day}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs font-semibold text-primary truncate" title={day.topic}>{day.topic}</p>
                                    {isCompleted ? (
                                        <div className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-green-600">
                                            <CheckCircle className="h-4 w-4"/> Completed
                                        </div>
                                    ) : isUnlocked ? (
                                        <p className="text-sm font-semibold mt-2">Start Challenge</p>
                                    ) : (
                                        <p className="text-sm mt-2">Locked</p>
                                    )}
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Day {day.day}: {day.topic}</DialogTitle>
                                <DialogDescriptionComponent>
                                    {day.description}
                                </DialogDescriptionComponent>
                            </DialogHeader>
                            <div className="my-6 space-y-4">
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                    {dayStatus.learn ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <BookOpen className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">Learn: {day.topic}</p>
                                        <p className="text-xs text-muted-foreground">Study the core concepts of today's topic.</p>
                                    </div>
                                    {!dayStatus.learn && (
                                        <Button size="sm" onClick={() => handleStartChallenge(day.day, 'learn')} disabled={!isUnlocked}>
                                            {isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                     {dayStatus.quiz ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Code className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">Complete Coding Quiz</p>
                                        <p className="text-xs text-muted-foreground">Test your knowledge on {day.topic}.</p>
                                    </div>
                                     {!dayStatus.quiz && (
                                        <Button size="sm" onClick={() => handleStartChallenge(day.day, 'quiz')} disabled={!isUnlocked}>
                                            {isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                    {dayStatus.interview ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Briefcase className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">Take a Mock Interview</p>
                                        <p className="text-xs text-muted-foreground">Practice your interview skills.</p>
                                    </div>
                                     {!dayStatus.interview && (
                                        <Button size="sm" onClick={() => handleStartChallenge(day.day, 'interview')} disabled={!isUnlocked}>
                                            {isUnlocked ? 'Start' : <Lock className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
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
