
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Video, Mic, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';

export default function MockInterviewInstructionsPage() {
  const searchParams = useSearchParams();
  const company = searchParams.get('company');
  const role = searchParams.get('role');
  const type = searchParams.get('type');

  const sessionParams = new URLSearchParams({
    company: company || '',
    role: role || '',
    type: type || 'technical',
  });

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <BrainCircuit className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-headline text-4xl font-bold">Video Interview</h1>
            <CardDescription className="text-lg">
              Get ready for a realistic video interview experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8 py-6">
            <div className="space-y-4">
                <h2 className="font-semibold text-2xl">Interview Details</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground bg-muted p-4 rounded-lg">
                    <li><strong className="text-foreground">Company:</strong> {company}</li>
                    <li><strong className="text-foreground">Role:</strong> <span className="capitalize">{role}</span></li>
                    <li><strong className="text-foreground">Interview Type:</strong> <span className="capitalize">{type}</span></li>
                </ul>
            </div>

             <div className="space-y-4">
              <h2 className="font-semibold text-2xl">Instructions</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enable Camera & Mic</h3>
                    <p className="text-muted-foreground text-sm">Your browser will ask for permission to use your camera and microphone. Please allow access.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Be Professional</h3>
                    <p className="text-muted-foreground text-sm">Find a quiet, well-lit space. The AI will be your interviewer on video.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Speak Naturally</h3>
                    <p className="text-muted-foreground text-sm">There's no push-to-talk. The system will detect when you're speaking and transcribe your response.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4 pt-4">
              <p className="text-2xl font-semibold text-primary">All the best!</p>
              <Button asChild size="lg">
                <Link href={`/dashboard/mock-interview/session?${sessionParams.toString()}`}>Start Interview</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

    