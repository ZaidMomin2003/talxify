
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';

export default function DraftPage() {

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                    <FlaskConical className="h-8 w-8" />
                </div>
                <CardTitle>Draft Page</CardTitle>
                <CardDescription>This page is used for testing and development purposes.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">The interview functionality has been moved to its correct route.</p>
            </CardContent>
        </Card>
    </main>
  );
}
