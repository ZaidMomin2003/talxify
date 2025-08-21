
'use client';

import { Suspense } from 'react';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { InterviewContainer } from './interview-container';

function InterviewPageContent({ params }: { params: { interviewId: string }}) {
    const { user } = useAuth();

    if (!user || !process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
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
            token={""} // We will generate this on the fly if needed, but for now we manage state outside VideoSDK
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
