
'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This component now acts as a wrapper for the Dialogflow Messenger.
// The entire chat UI is handled by the `df-messenger` web component.
// It communicates with the webhook defined at `/app/api/dialogflow-webhook/route.ts`.

function DraftInterviewPageComponent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // These parameters are passed to Dialogflow to initialize the session.
    const interviewId = `draft_interview_${user?.uid}_${Date.now()}`;
    const topic = searchParams.get('topic') || 'General Software Engineering';
    const level = searchParams.get('level') || 'entry-level';
    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company') || '';

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    // Event listener for when the interview session ends.
    const handleSessionEnded = () => {
        // Since this is a draft/demo page, we can just redirect to the dashboard.
        // A real implementation would save the transcript and go to a results page.
        router.push('/dashboard');
    };

    React.useEffect(() => {
        const dfMessenger = document.querySelector('df-messenger');
        if (dfMessenger && user) {
            // Set session parameters dynamically for Dialogflow
            const sessionParams = {
                userId: user.uid,
                interviewId: interviewId,
                topic: topic,
                level: level,
                role: role,
                company: company,
                isComplete: false,
                history: [],
                // Custom parameters to select STT/TTS providers
                stt_provider: 'deepgram',
                tts_provider: 'deepgram',
            };
            dfMessenger.setAttribute('session-parameters', JSON.stringify(sessionParams));
            
            // Add event listener for session end
            dfMessenger.addEventListener('df-session-ended', handleSessionEnded);
        }
        
        return () => {
             if (dfMessenger) {
                dfMessenger.removeEventListener('df-session-ended', handleSessionEnded);
             }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, interviewId, topic, level, role, company]);

    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col bg-muted/40">
            <style jsx global>{`
                df-messenger {
                    --df-messenger-bot-message: hsl(var(--primary-foreground));
                    --df-messenger-button-titlebar-color: hsl(var(--primary));
                    --df-messenger-chat-background-color: hsl(var(--background));
                    --df-messenger-font-color: hsl(var(--foreground));
                    --df-messenger-input-box-color: hsl(var(--card));
                    --df-messenger-input-font-color: hsl(var(--foreground));
                    --df-messenger-message-bot-font-size: 1rem;
                    --df-messenger-message-user-font-size: 1rem;
                    --df-messenger-user-message: hsl(var(--primary));
                    --df-messenger-send-icon: hsl(var(--primary));
                    --df-messenger-chip-border-color: hsl(var(--primary));
                }
            `}</style>
             <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1" async></script>
             <df-messenger
                project-id="talxify-ijwhm"
                agent-id="95a63960-4447-430b-936e-b6a4a7538357"
                language-code="en"
                intent="WELCOME"
                chat-title="Talxify AI Interview"
                chat-icon="/logo-icon-light.png"
                wait-open="true"
                expand="true"
             >
             </df-messenger>
        </div>
    );
}

export default function DraftInterviewPage() {
    return (
        <React.Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <DraftInterviewPageComponent />
        </React.Suspense>
    )
}
