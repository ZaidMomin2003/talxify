
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
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
            <h1 className="font-headline text-4xl font-bold">Mock Interview</h1>
            <CardDescription className="text-lg">
              You're all set! Get ready to start your interview.
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
            
            <div className="text-center space-y-4">
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

    