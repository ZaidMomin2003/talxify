
'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// This page is now a simple redirector to the instructions page,
// as the live component is being handled on the draft page.

function InterviewRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to a more appropriate place, like the arena,
        // as the specific interview flow is now part of the arena's tasks.
        router.replace('/dashboard/arena');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="text-center">
                 <CardHeader>
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <CardTitle>Redirecting...</CardTitle>
                    <CardDescription>Moving to the interview arena.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}

export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
        }>
            <InterviewRedirectPage />
        </Suspense>
    );
}
