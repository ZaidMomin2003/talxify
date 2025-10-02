
'use client';

import React from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, MessageSquare, Bot, ArrowRight, Video } from 'lucide-react';
import Link from 'next/link';

export default function InterviewInstructionsPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    
    const interviewId = params.interviewId as string;
    const topic = searchParams.get('topic') || 'Not specified';
    const role = searchParams.get('role');
    const level = searchParams.get('level');
    const company = searchParams.get('company');

    const startUrl = `/dashboard/interview/${interviewId}?${searchParams.toString()}`;

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
                                {company && <li><strong className="text-foreground">Company:</strong> {company}</li>}
                            </ul>
                        </div>

                         <div className="space-y-4">
                            <h2 className="font-semibold text-2xl">How It Works</h2>
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
                            <Button asChild size="lg">
                                <Link href={startUrl}>Start Interview</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
