
'use client';

import { Suspense, useEffect, useState, use } from 'react';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { InterviewContainer } from './interview-container';
import { generateVideoSDKToken } from '@/app/actions/videosdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';

function InterviewPageContent() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const interviewId = params.interviewId as string;

    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeSession = async () => {
            if (!user) {
                // Wait for user to be available
                return;
            }

            // --- Configuration Checks ---
            if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
                setError("Deepgram API key is not configured. Please add it to your environment variables to use the interview feature.");
                setIsLoading(false);
                return;
            }
            if (!process.env.VIDEOSDK_API_KEY || !process.env.VIDEOSDK_SECRET_KEY) {
                setError("VideoSDK API Key or Secret is not configured. Please check your environment variables.");
                 setIsLoading(false);
                return;
            }

            try {
                // --- Token Generation ---
                const generatedToken = await generateVideoSDKToken();
                if (!generatedToken) {
                    throw new Error("Generated token is null or undefined.");
                }
                setToken(generatedToken);
            } catch (err) {
                console.error("Failed to get VideoSDK token", err);
                setError("Could not initialize the interview session. Please ensure your VideoSDK credentials are correct and try again.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeSession();
    }, [user]);

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

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground p-4">
                <Card className="max-w-md w-full text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                        <AlertTriangle className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Session Error</CardTitle>
                        <CardDescription>
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (!token) {
        // This case handles when loading is finished but token is still null for some reason.
         return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground p-4">
                <Card className="max-w-md w-full text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                        <AlertTriangle className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Initialization Failed</CardTitle>
                        <CardDescription>
                            Failed to generate a valid session token for the interview.
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
                meetingId: interviewId,
                micEnabled: true,
                webcamEnabled: true,
                name: user?.displayName || 'Interviewee',
            }}
            token={token}
        >
            <InterviewContainer interviewId={interviewId} />
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
            <InterviewPageContent />
        </Suspense>
    )
}
