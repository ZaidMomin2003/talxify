
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, LogIn, Bot, BadgeHelp, Download } from 'lucide-react';
import { getSurveySubmissions } from '@/app/zaidmin/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { SurveySubmission } from '@/lib/types';

export default function SurveySubmissionsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSurveySubmissions();
            setSubmissions(data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch submissions.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');

        setTimeout(() => {
            if (password === 'Zaid@226194') {
                setIsAuthenticated(true);
                fetchSubmissions();
            } else {
                setError('Invalid password.');
            }
            setIsLoggingIn(false);
        }, 500);
    };

    const exportToCSV = () => {
        const headers = [
            "Timestamp", "Name", "Email", "Biggest Challenge", "AI Practice Value (1-10)", "Practice Method", "Helpful Tools", "Price Point", "Desired Languages", "Feedback Importance (1-10)", "Experience Level", "Likelihood to Use (1-10)", "Other Feedback"
        ];
        
        const rows = submissions.map(sub => [
            sub.timestamp ? `"${format(sub.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss')}"` : 'N/A',
            `"${sub.name || ''}"`,
            `"${sub.email || ''}"`,
            `"${(sub.challenge || '').replace(/"/g, '""')}"`,
            sub.aiValue || '',
            `"${sub.practiceMethod?.join(', ') || ''}"`,
            `"${sub.helpfulTools?.join(', ') || ''}"`,
            `"${sub.pricePoint || ''}"`,
            `"${sub.languages?.join(', ') || ''}"`,
            sub.feedbackImportance || '',
            `"${sub.experienceLevel || ''}"`,
            sub.likelihood || '',
            `"${(sub.otherFeedback || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "survey_submissions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/40">
                <Card className="w-full max-w-sm shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Bot size={32} />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold font-headline">Admin Access</CardTitle>
                        <CardDescription>Enter password to view survey submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoggingIn}>
                                {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                                View Submissions
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-primary" /></div>;
    }

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Survey Submissions ({submissions.length})</CardTitle>
                        <CardDescription>All user feedback submitted through the pre-launch survey.</CardDescription>
                    </div>
                    <Button onClick={exportToCSV} disabled={submissions.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export to CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {submissions.map((sub, index) => (
                            <AccordionItem value={`item-${index}`} key={sub.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between w-full pr-4 items-center">
                                        <div className="flex items-center gap-3">
                                            <BadgeHelp className="h-5 w-5 text-primary"/>
                                            <div className="text-left">
                                                <p className="font-semibold">{sub.name || 'Anonymous'}</p>
                                                <p className="text-sm text-muted-foreground">{sub.email}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                           {sub.timestamp ? format(sub.timestamp.toDate(), 'PPP p') : 'N/A'}
                                        </p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50 rounded-b-lg">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <h4>Biggest Challenge</h4>
                                        <p>{sub.challenge}</p>

                                        <h4>How valuable is a conversational AI for practice? (1-10)</h4>
                                        <p><Badge variant="secondary">{sub.aiValue}</Badge></p>

                                        <h4>Preferred practice methods</h4>
                                        <p>{sub.practiceMethod?.join(', ')}</p>

                                        <h4>Most helpful AI tools (Top 2)</h4>
                                        <p>{sub.helpfulTools?.join(', ')}</p>

                                        <h4>Willing to pay per month</h4>
                                        <p><Badge>{sub.pricePoint}</Badge></p>

                                        <h4>Desired languages</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {sub.languages?.map((lang: string) => <Badge key={lang} variant="outline">{lang}</Badge>)}
                                        </div>

                                        <h4>Importance of feedback (1-10)</h4>
                                        <p><Badge variant="secondary">{sub.feedbackImportance}</Badge></p>
                                        
                                        <h4>Experience Level</h4>
                                        <p>{sub.experienceLevel}</p>
                                        
                                        <h4>Likelihood to use (1-10)</h4>
                                        <p><Badge variant="secondary">{sub.likelihood}</Badge></p>

                                        <h4>Other feedback</h4>
                                        <p>{sub.otherFeedback || 'None'}</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </main>
    )
}
