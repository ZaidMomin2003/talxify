
'use client';

import React, { useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, MessageSquare, Bot, ArrowRight, Video, Building, BarChartHorizontal, Sparkles, Wifi, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InterviewInstructionsPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    
    const interviewId = params.interviewId as string;
    const topic = searchParams.get('topic') || 'Not specified';
    const role = searchParams.get('role');
    const level = searchParams.get('level');
    
    const [company, setCompany] = useState(searchParams.get('company') || '');
    const [difficulty, setDifficulty] = useState('moderate');
    const [isNavigating, setIsNavigating] = useState(false);

    const handleStart = () => {
        setIsNavigating(true);
        const startUrl = new URLSearchParams({
            topic,
            role: role || '',
            level: level || '',
            company,
            difficulty,
        });
        router.push(`/dashboard/interview/${interviewId}?${startUrl.toString()}`);
    }

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
                            <MessageSquare className="h-10 w-10" />
                        </div>
                        <CardTitle className="font-headline text-4xl font-bold">Mock Interview Instructions</CardTitle>
                        <CardDescription className="text-lg">
                            You're about to start a mock interview with Kathy, our AI interviewer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 px-8 py-6">
                        <div className="space-y-4">
                            <h2 className="font-semibold text-2xl">Interview Details</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground bg-muted p-4 rounded-lg">
                                <li><strong className="text-foreground">Topic:</strong> {topic}</li>
                                {role && <li><strong className="text-foreground">Role:</strong> {role}</li>}
                                {level && <li><strong className="text-foreground">Level:</strong> {level}</li>}
                            </ul>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <div>
                                    <Label htmlFor="company" className="flex items-center gap-2 mb-2"><Building className="w-4 h-4"/> Target Company (Optional)</Label>
                                    <Input id="company" placeholder="e.g., Google, Amazon" value={company} onChange={(e) => setCompany(e.target.value)} />
                                </div>
                                <div>
                                     <Label htmlFor="difficulty" className="flex items-center gap-2 mb-2"><BarChartHorizontal className="w-4 h-4"/> Difficulty</Label>
                                     <Select value={difficulty} onValueChange={setDifficulty}>
                                        <SelectTrigger id="difficulty">
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="difficult">Difficult</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                         <div className="space-y-4">
                            <h2 className="font-semibold text-2xl">Instructions</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 text-primary rounded-full p-2 mt-1">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Conversational AI</h3>
                                        <p className="text-muted-foreground text-sm">Kathy will ask you technical and behavioral questions just like a real interviewer.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                     <div className="bg-primary/10 text-primary rounded-full p-2 mt-1">
                                        <Video className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Enable Camera & Mic</h3>
                                        <p className="text-muted-foreground text-sm">For the best experience, allow access to your camera and microphone when prompted.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                     <div className="bg-destructive/10 text-destructive rounded-full p-2 mt-1">
                                        <Wifi className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Stable Internet Connection</h3>
                                        <p className="text-muted-foreground text-sm">Ensure you are in an area with a good internet connection. An interrupted session cannot be resumed.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 text-primary rounded-full p-2 mt-1">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Be Professional</h3>
                                        <p className="text-muted-foreground text-sm">Treat this as a real interview. Speak clearly and structure your answers thoughtfully.</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 text-primary rounded-full p-2 mt-1">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Answer in Detail</h3>
                                        <p className="text-muted-foreground text-sm">Provide comprehensive answers. The more detail you give, the better the AI can analyze your performance.</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 text-primary rounded-full p-2 mt-1">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Proceed When Ready</h3>
                                        <p className="text-muted-foreground text-sm">Click the button below to start the interview session when you are ready.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <Button onClick={handleStart} size="lg" disabled={isNavigating}>
                                {isNavigating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                )}
                                Start Interview
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
