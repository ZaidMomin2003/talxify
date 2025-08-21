
'use client';

import { Suspense, useEffect, useState } from 'react';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { InterviewContainer } from './interview-container';
import { generateVideoSDKToken } from '@/app/actions/videosdk';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function InterviewPageContent({ params }: { params: { interviewId: string }}) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setIsLoading(true);

            // First, check for the client-side Deepgram key
            if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
                setError("Deepgram API key is not configured. Please add it to your environment variables to use the interview feature.");
                setIsLoading(false);
                return;
            }

            generateVideoSDKToken()
                .then(setToken)
                .catch(err => {
                    console.error("Failed to get VideoSDK token", err);
                    setError("Could not initialize the interview session. Please check your VideoSDK API key and secret and try again.");
                    toast({
                        title: "Initialization Failed",
                        description: "Failed to generate a valid session token for the interview.",
                        variant: "destructive"
                    });
                })
                .finally(() => {
                     // Only stop loading if there wasn't a different error first
                    if (!error) {
                        setIsLoading(false);
                    }
                });
        }
    }, [user, toast, error]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p>Initializing interview session...</p>
                </div>
            </div>
        )
    }

    if (error || !token) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground p-4">
                <Card className="max-w-md w-full text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                        <AlertTriangle className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Session Error</CardTitle>
                        <CardDescription>
                            {error || "An unknown error occurred while setting up the interview."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    return (
        <MeetingProvider
            config={{
                meetingId: params.interviewId,
                micEnabled: true,
                webcamEnabled: true,
                name: user?.displayName || 'Interviewee',
            }}
            token={token}
        >
            <InterviewContainer interviewId={params.interviewId} />
        </MeetingProvider>
    )
}


export default function InterviewPage({ params }: { params: { interviewId: string }}) {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p>Preparing Interview...</p>
                </div>
            </div>
        }>
            <InterviewPageContent params={params}/>
        </Suspense>
    )
}
