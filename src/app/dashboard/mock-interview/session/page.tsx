
'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function MockInterviewSessionPage() {
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');
    const role = searchParams.get('role');

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Mock Interview Session</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-muted-foreground">Starting your interview for the role of <span className="font-bold text-foreground">{role}</span> on the topic of <span className="font-bold text-foreground">{topic}</span>...</p>
                            <p className="text-sm text-muted-foreground">(This is a placeholder page for the interview session)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
