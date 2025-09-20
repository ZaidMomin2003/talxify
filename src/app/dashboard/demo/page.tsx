
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeprecatedDemoPage() {
  const router = useRouter();
  
  // This page is no longer in use. Redirect users to the dashboard or arena.
  React.useEffect(() => {
    router.replace('/dashboard/arena');
  }, [router]);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                    <FlaskConical className="h-8 w-8" />
                </div>
                <CardTitle>Page Moved</CardTitle>
                <CardDescription>Redirecting you to the Arena...</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">The demo functionality has been replaced by the live interview feature in the Arena.</p>
            </CardContent>
        </Card>
    </main>
  );
}
