
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DemoPage() {
  const router = useRouter();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-lg text-center shadow-lg">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                    <FlaskConical className="h-8 w-8" />
                </div>
                <CardTitle>This Demo is Now the Real Thing!</CardTitle>
                <CardDescription>The AI voice interviewer has been fully integrated into the main application flow.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">
                    To try out the AI-powered mock interviews, please go to the Arena. This is where all the action happens now!
                </p>
                <Button asChild size="lg">
                    <Link href="/dashboard/arena">Go to Arena</Link>
                </Button>
            </CardContent>
        </Card>
    </main>
  );
}
