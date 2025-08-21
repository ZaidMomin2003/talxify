
'use client';

import { Suspense, useEffect, useState } from 'react';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { InterviewContainer } from './interview-container';
import { generateVideoSDKToken } from '@/app/actions/videosdk';

function InterviewPageContent({ params }: { params: { interviewId: string }}) {
    const { user } = useAuth();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            generateVideoSDKToken()
                .then(setToken)
                .catch(err => {
                    console.error("Failed to get VideoSDK token", err);
                    // Handle error, maybe show a message to the user
                });
        }
    }, [user]);

    if (!user || !process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || !token) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p>Loading configuration...</p>
                </div>
            </div>
        )
    }
    
    return (
        <MeetingProvider
            config={{
                meetingId: params.interviewId,
                micEnabled: true,
                webcamEnabled: true,
                name: user.displayName || 'Interviewee',
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
