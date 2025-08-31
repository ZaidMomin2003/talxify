
'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity } from '@/lib/types';


function DialogflowMessenger() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const interviewId = params.interviewId as string;

    const topic = searchParams.get('topic') || 'General';
    const level = searchParams.get('level') || 'entry-level';
    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company') || '';

    // These values are from your Google Cloud project.
    const PROJECT_ID = 'talxify-ijwhm';
    const AGENT_ID = '06be1b06-869c-4f8c-9420-542615d5e5ab';
    const LOCATION = 'us-central1';

    const handleSessionEnded = async (detail: any) => {
        console.log("Dialogflow session ended. Transcript:", detail.transcript);
        
        if (user && detail.transcript && detail.transcript.length > 0) {
            const finalActivity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: detail.transcript, // The transcript from Dialogflow
                feedback: "Feedback will be generated on the results page.",
                details: { topic, role, level, company }
            };
            
            await addActivity(user.uid, finalActivity);
            
            if (topic === 'Icebreaker Introduction') {
                 router.push('/dashboard/arena');
            } else {
                 router.push(`/dashboard/interview/${interviewId}/results`);
            }
        } else {
            router.push('/dashboard');
        }
    };
    
    // Attach event listener when the component mounts
    React.useEffect(() => {
        const messenger = document.querySelector('df-messenger');
        if (messenger) {
            const handleSessionEndedEvent = (event: CustomEvent) => handleSessionEnded(event.detail);
            messenger.addEventListener('df-session-ended', handleSessionEndedEvent as EventListener);

            // Clean up the event listener when the component unmounts
            return () => {
                messenger.removeEventListener('df-session-ended', handleSessionEndedEvent as EventListener);
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, interviewId, topic, role, level, company, router]);
    
    // Construct the initial session parameters
    const sessionParams = JSON.stringify({
        userId: user?.uid,
        interviewId,
        topic,
        level,
        role,
        company,
        isComplete: false,
        history: [],
    });

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <df-messenger
                project-id={PROJECT_ID}
                agent-id={AGENT_ID}
                location={LOCATION}
                language-code="en"
                session-params={sessionParams}
            >
                <df-messenger-chat-bubble
                    chat-title="Talxify AI Interviewer"
                    bot-writing-text="Alex is typing..."
                    user-input-placeholder="Type your response..."
                />
            </df-messenger>
        </div>
    );
}

function InterviewPageContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <>
            <Script src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js" />
            <style jsx global>{`
              df-messenger {
                --df-messenger-bot-message: hsl(var(--secondary));
                --df-messenger-font-color: hsl(var(--foreground));
                --df-messenger-user-message: hsl(var(--primary));
                --df-messenger-chat-background: hsl(var(--background));
                --df-messenger-input-box-background: hsl(var(--card));
                --df-messenger-input-font-color: hsl(var(--foreground));
                --df-messenger-input-placeholder-font-color: hsl(var(--muted-foreground));
                --df-messenger-minimized-chat-close-icon-color: hsl(var(--primary-foreground));
                --df-messenger-titlebar-background: hsl(var(--primary));
                --df-messenger-titlebar-font-color: hsl(var(--primary-foreground));
              }
            `}</style>
            <DialogflowMessenger />
        </>
    );
}


export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <InterviewPageContent />
        </Suspense>
    )
}
