'use client';

// This page is intended for drafting and testing components.
// The main interview logic has been moved to /dashboard/interview/[interviewId]/page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";
import Link from "next/link";

export default function DraftPage() {

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
                    <FlaskConical className="h-10 w-10" />
                </div>
                <CardTitle className="text-3xl font-bold font-headline">Draft Page</CardTitle>
                <CardDescription>
                    This is a development area for testing new components and features. The live interview functionality has been moved.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
