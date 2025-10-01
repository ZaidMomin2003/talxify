
'use client';

import {
  MessageSquare,
  Mic,
  Phone,
  Loader2,
  AlertTriangle,
  Maximize,
  MicOff,
  RefreshCw,
} from 'lucide-react';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import LiveInterviewComponent from './live-interview-component';


function InterviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  
  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  const addTranscriptEntry = useCallback((entry: TranscriptEntry) => {
    setTranscript((prev) => [...prev, entry]);
  }, []);

  const handleStopInterview = useCallback(async (save: boolean) => {
    if (save && user && transcript.length > 0) {
      const interviewActivity: InterviewActivity = {
        id: interviewId,
        type: 'interview',
        timestamp: new Date().toISOString(),
        transcript: transcript,
        feedback: 'Feedback will be generated on the results page.',
        details: { topic, role, level, company },
      };
      try {
        await addActivity(user.uid, interviewActivity);
        router.push(`/dashboard/interview/${interviewActivity.id}/results`);
      } catch (error) {
        console.error("Failed to save interview activity:", error);
        router.push('/dashboard/arena');
      }
    } else {
      router.push('/dashboard/arena');
    }
  }, [user, interviewId, topic, role, level, company, router, transcript]);


  return (
    <LiveInterviewComponent
      addTranscriptEntry={addTranscriptEntry}
      stopInterview={handleStopInterview}
      transcript={transcript}
    />
  );
}


export default function InterviewPageWrapper() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
            <InterviewPage />
        </Suspense>
    )
}
