
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';

export default function DemoPage() {

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                    <FlaskConical className="h-8 w-8" />
                </div>
                <CardTitle>Demo Page</CardTitle>
                <CardDescription>This is a placeholder for a demo feature.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Ready for instructions.</p>
            </CardContent>
        </Card>
    </main>
  );
}
