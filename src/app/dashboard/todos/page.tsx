
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

export default function TodosPage() {
    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                            <ListChecks className="w-6 h-6 text-primary"/>
                            My Prep To-Do List
                        </CardTitle>
                        <CardDescription>
                            Stay organized and focused on your interview preparation goals.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">To-do list functionality will be built here.</p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
