
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function InterviewPlaceholderPage() {
    const router = useRouter();

    const goToDemoResults = () => {
        router.push('/dashboard/interview/demo/results');
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Interview In Progress</h1>
                <p className="text-muted-foreground mb-8">The live interview feature is currently being rebuilt.</p>
                <Button onClick={goToDemoResults} size="lg">
                    Proceed to Demo Results Page
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
