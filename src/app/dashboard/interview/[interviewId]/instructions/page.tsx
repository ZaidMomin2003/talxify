
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Wifi, BrainCircuit, Keyboard, Briefcase, PlayCircle, Laptop } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

function Instructions() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const interviewId = params.interviewId as string;

  const topic = searchParams.get('topic') || 'your selected topic';
  
  const queryParams = new URLSearchParams(window.location.search);

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-headline text-4xl font-bold">Interview Instructions</h1>
            <CardDescription className="text-lg">
              You're about to start your mock interview on <span className="font-semibold text-foreground">{topic}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8 py-6">
            
            <div className="space-y-4">
              <h2 className="font-semibold text-2xl">How It Works</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Use a Laptop/Desktop</h3>
                    <p className="text-muted-foreground text-sm">For the best experience, please use a computer with a physical keyboard.</p>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <Keyboard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Push-to-Talk</h3>
                    <p className="text-muted-foreground text-sm">When it's your turn, press and hold the <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Spacebar</kbd> to speak. Release to submit your answer.</p>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <Wifi className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Stable Connection</h3>
                    <p className="text-muted-foreground text-sm">For the best experience, please ensure you have a stable and fast internet connection.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Get Feedback</h3>
                    <p className="text-muted-foreground text-sm">After the interview, you'll receive a detailed analysis of your performance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button onClick={() => router.push(`/dashboard/interview/${interviewId}?${queryParams.toString()}`)} size="lg">
                <PlayCircle className="mr-2 h-5 w-5"/>
                Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


export default function InterviewInstructionsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Instructions />
        </Suspense>
    )
}
