
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription as DialogDescriptionComponent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Swords, Lock, PlayCircle, BookOpen, Code, Briefcase } from "lucide-react";
import { cn } from '@/lib/utils';

const dailyTasks = [
    { icon: <BookOpen className="h-5 w-5 text-yellow-500" />, title: "Learn a New Skill", description: "Study a new data structure or algorithm." },
    { icon: <Code className="h-5 w-5 text-blue-500" />, title: "Complete Coding Quiz", description: "Test your knowledge with a targeted quiz." },
    { icon: <Briefcase className="h-5 w-5 text-green-500" />, title: "Take a Mock Interview", description: "Practice your communication and problem-solving." },
];


export default function ArenaPage() {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const completedDays = 0; // In a real app, this would come from user data

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-headline">
              <Swords className="h-8 w-8" /> 30-Day Interview Prep Arena
            </CardTitle>
            <CardDescription>
              Complete daily tasks to sharpen your skills and prepare for your next big opportunity. Complete one day to unlock the next.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {days.map((day) => {
                const isUnlocked = day <= completedDays + 1;
                const isCompleted = day <= completedDays;

                return (
                     <Dialog key={day}>
                        <DialogTrigger asChild disabled={!isUnlocked}>
                             <Card 
                                className={cn(
                                    "text-center transition-all duration-300 transform hover:-translate-y-1",
                                    isUnlocked ? "cursor-pointer hover:shadow-primary/20 hover:border-primary/50" : "cursor-not-allowed bg-muted/50 text-muted-foreground",
                                    isCompleted && "bg-green-500/10 border-green-500/50"
                                )}
                            >
                                <CardHeader>
                                    <CardTitle className="flex flex-col items-center gap-2">
                                        {!isUnlocked && <Lock className="h-6 w-6 mb-2" />}
                                        Day {day}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isCompleted ? (
                                        <p className="text-sm font-semibold text-green-600">Completed</p>
                                    ) : isUnlocked ? (
                                        <p className="text-sm text-primary">Start Challenge</p>
                                    ) : (
                                        <p className="text-sm">Locked</p>
                                    )}
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Day {day} Challenge</DialogTitle>
                                <DialogDescriptionComponent>
                                    Complete these tasks to master your skills for today.
                                </DialogDescriptionComponent>
                            </DialogHeader>
                            <div className="my-6 space-y-4">
                                {dailyTasks.map(task => (
                                    <div key={task.title} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                        <div className="flex-shrink-0">{task.icon}</div>
                                        <div>
                                            <p className="font-semibold text-foreground">{task.title}</p>
                                            <p className="text-xs text-muted-foreground">{task.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button size="lg" className="w-full">
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Let's Start Day {day}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            })}
        </div>
      </div>
    </main>
  );
}
