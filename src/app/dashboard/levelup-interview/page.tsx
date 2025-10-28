
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function LevelUpInterviewPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
       <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                        <MessageSquare className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Level Up Interview</CardTitle>
                    <CardDescription>
                        This new feature is coming soon. Stay tuned!
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    </main>
  );
}
