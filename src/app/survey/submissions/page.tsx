
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
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
            setIsAuthenticated(true);
            fetchSubmissions();
        } else {
            setIsLoading(false);
        }
    }, [fetchSubmissions]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');

        setTimeout(() => {
            if (password === 'Zaid@226194') {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
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

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-primary" /></div>;
    }

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

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                        {submissions.length > 0 ? submissions.map((sub, index) => (
                            <AccordionItem value={`item-${index}`} key={sub.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between w-full pr-4 items-center flex-wrap gap-x-4 gap-y-2">
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
                                    <div className="prose prose-sm dark:prose-invert max-w-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        <div>
                                            <h4>Biggest Challenge</h4>
                                            <p>{sub.challenge || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h4>AI Practice Value (1-10)</h4>
                                            <p><Badge variant="secondary">{sub.aiValue || 'N/A'}</Badge></p>
                                        </div>
                                        <div>
                                            <h4>Preferred practice methods</h4>
                                            <p>{sub.practiceMethod?.join(', ') || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h4>Most helpful AI tools</h4>
                                            <p>{sub.helpfulTools?.join(', ') || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h4>Willing to pay per month</h4>
                                            <p><Badge>{sub.pricePoint || 'N/A'}</Badge></p>
                                        </div>
                                        <div>
                                            <h4>Feedback Importance (1-10)</h4>
                                            <p><Badge variant="secondary">{sub.feedbackImportance || 'N/A'}</Badge></p>
                                        </div>
                                        <div>
                                            <h4>Experience Level</h4>
                                            <p>{sub.experienceLevel || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h4>Likelihood to use (1-10)</h4>
                                            <p><Badge variant="secondary">{sub.likelihood || 'N/A'}</Badge></p>
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <h4>Desired languages</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {sub.languages?.map((lang: string) => <Badge key={lang} variant="outline">{lang}</Badge>) || 'N/A'}
                                            </div>
                                        </div>
                                         <div className="md:col-span-2 lg:col-span-3">
                                            <h4>Other feedback</h4>
                                            <p>{sub.otherFeedback || 'None'}</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
                        )}
                    </Accordion>
                </CardContent>
            </Card>
        </main>
    )
}
