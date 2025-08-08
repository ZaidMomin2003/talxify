
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react';
import type { StoredActivity } from '@/lib/types';


export default function MockInterviewInstructionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const role = searchParams.get('role');

  const sessionParams = new URLSearchParams({
    topic: topic || '',
    role: role || '',
  });

  const handleStartInterview = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
        const newInterview: StoredActivity = {
            id: `interview_${Date.now()}`,
            type: 'interview',
            timestamp: new Date().toISOString(),
            details: {
                topic: topic || 'N/A',
                role: role || 'N/A',
            }
        };

        const allActivity: StoredActivity[] = JSON.parse(localStorage.getItem('allUserActivity') || '[]');
        allActivity.unshift(newInterview);
        localStorage.setItem('allUserActivity', JSON.stringify(allActivity.slice(0, 20))); // Keep last 20 activities
    }
    router.push(`/dashboard/mock-interview/session?${sessionParams.toString()}`);
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <BrainCircuit className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-headline text-4xl font-bold">Mock Interview</h1>
            <CardDescription className="text-lg">
              You're all set! Get ready to start your interview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8 py-6">
            <div className="space-y-4">
                <h2 className="font-semibold text-2xl">Interview Details</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground bg-muted p-4 rounded-lg">
                    <li><strong className="text-foreground">Topic:</strong> {topic}</li>
                    <li><strong className="text-foreground">Role:</strong> <span className="capitalize">{role}</span></li>
                </ul>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-2xl font-semibold text-primary">All the best!</p>
              <Button asChild size="lg">
                <Link href={`/dashboard/mock-interview/session?${sessionParams.toString()}`} onClick={handleStartInterview}>Start Interview</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
