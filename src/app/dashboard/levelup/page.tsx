
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

export default function LevelUpPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
              <Rocket className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Level Up</CardTitle>
            <CardDescription>
              This new feature is coming soon. Stay tuned!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We're building something exciting to help you take your skills to the next level.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
