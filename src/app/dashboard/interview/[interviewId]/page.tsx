// This file is no longer needed as the "draft" page now handles this functionality.
// It can be deleted or kept as a redirect.

'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function InterviewRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new draft page for this functionality
        router.replace('/dashboard/draft');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="text-center">
                 <CardHeader>
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <CardTitle>Redirecting...</CardTitle>
                    <CardDescription>Moving to the live interview draft page.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
