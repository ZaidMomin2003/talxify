
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mic, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

// Placeholder for the new Dialogflow Interview Component
// This will be fleshed out once credentials are provided.
function DialogflowInterview() {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    // This effect will be replaced with actual Dialogflow connection logic
    useEffect(() => {
        const timer = setTimeout(() => setStatus('ready'), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Initializing Dialogflow session...</p>
            </div>
        )
    }

     if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                 <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-destructive-foreground">Could not connect to Dialogflow.</p>
            </div>
        )
    }

    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Dialogflow Interview Ready</h2>
            <p className="text-muted-foreground mb-6">The new interview client will be implemented here.</p>
            <Button size="lg">
                <Mic className="mr-2"/> Start Mock Interview
            </Button>
        </div>
    )
}


function DraftPageContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    if (authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p>Loading...</p>
                </div>
            </div>
        )
    }
    
    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-4xl h-[70vh] flex items-center justify-center">
                <CardContent className="p-0">
                   <DialogflowInterview />
                </CardContent>
            </Card>
        </div>
    )
}

export default function DraftPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <DraftPageContent />
        </Suspense>
    )
}
