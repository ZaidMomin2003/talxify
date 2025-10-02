'use client';

import { Suspense } from 'react';
import LiveInterviewComponent from './live-interview-component';
import { Loader2 } from 'lucide-react';

function LiveInterviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
        }>
            <LiveInterviewComponent />
        </Suspense>
    );
}

export default LiveInterviewPage;
