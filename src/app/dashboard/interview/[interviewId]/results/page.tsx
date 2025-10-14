// This file is intentionally left empty. The functionality has been moved to a toast summary.
// The demo page is preserved at /dashboard/interview/[interviewId]/results/page.tsx
// by checking for the 'demo' slug.

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';


export default function InterviewResultsPage() {
    const router = useRouter();
    const params = useParams();
    const interviewId = params.interviewId as string;

    useEffect(() => {
        if (interviewId !== 'demo') {
            router.replace('/dashboard');
        }
    }, [interviewId, router]);
    
    // Render a simple message for the demo case, or while redirecting.
    return (
         <main className="p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8 text-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Redirecting...</CardTitle>
                        <CardDescription>This page is no longer in use. Redirecting to your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild variant="secondary">
                            <a href="/dashboard">Back to Dashboard</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
