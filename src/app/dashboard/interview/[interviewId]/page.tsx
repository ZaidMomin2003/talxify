

'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, StoredActivity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


// This component is now a wrapper for the Dialogflow Messenger.
// The actual chat logic is handled by the `df-messenger` web component.
// It communicates with the webhook defined at `/app/api/dialogflow-webhook/route.ts`.

function InterviewPageComponent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        // This should be handled by a layout or higher-order component,
        // but as a fallback, we redirect.
        router.push('/login');
        return null;
    }
    
    const interviewId = params.interviewId as string;

    // These parameters are passed to Dialogflow to initialize the session.
    const topic = searchParams.get('topic') || 'General';
    const level = searchParams.get('level') || 'entry-level';
    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company') || '';

    const handleSessionEnded = async (event: CustomEvent) => {
        const history = event.detail.history;
        if (history && history.length > 0) {
            
            const transcript = history.map((entry: any) => ({
                speaker: entry.role === 'user' ? 'user' : 'ai',
                text: entry.text,
            }));

            // Save the results to Firebase
            const finalActivity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcript,
                feedback: "Feedback will be generated on the results page.",
                details: { topic, role, level, company }
            };
            await addActivity(user.uid, finalActivity);
            toast({ title: "Interview Complete!", description: "Redirecting to your results..." });
            router.push(`/dashboard/interview/${interviewId}/results`);
        } else {
             // Handle case where interview ends prematurely
            router.push('/dashboard');
        }
    };


    React.useEffect(() => {
        const dfMessenger = document.querySelector('df-messenger');
        if (dfMessenger) {
            // Set session parameters dynamically
            const sessionParams = {
                userId: user.uid,
                interviewId: interviewId,
                topic: topic,
                level: level,
                role: role,
                company: company,
                isComplete: false,
                history: []
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
    }, [user.uid, interviewId, topic, level, role, company]);


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
             <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
             <df-messenger
                project-id="talxify-ijwhm"
                agent-id="95a63960-4447-430b-936e-b6a4a7538357"
                language-code="en"
                intent="WELCOME"
                chat-title="Talxify AI Interviewer"
                chat-icon="/logo-icon-light.png"
                wait-open="true"
                expand="true"
             >
             </df-messenger>
        </div>
    );
}

export default function InterviewPage() {
    return (
        <React.Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <InterviewPageComponent />
        </React.Suspense>
    )
}
