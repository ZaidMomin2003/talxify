
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Sparkles, Loader2, History, BarChart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { addActivity, getUserData, checkAndIncrementUsage } from '@/lib/firebase-service';
import type { UserData, InterviewQuestionSetActivity, GenerateInterviewQuestionsInput } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const questionsGeneratorSchema = z.object({
  role: z.string().min(2, "Please enter a job role."),
  description: z.string().min(10, "Please provide a brief job description."),
  level: z.enum(['entry-level', 'mid-level', 'senior', 'principal']),
  company: z.string().optional(),
});

type QuestionsGeneratorFormValues = z.infer<typeof questionsGeneratorSchema>;

export default function InterviewQuestionsGeneratorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const form = useForm<QuestionsGeneratorFormValues>({
    resolver: zodResolver(questionsGeneratorSchema),
    defaultValues: {
      role: '',
      description: '',
      level: 'mid-level',
      company: '',
    },
  });
  
  const fetchUserData = useCallback(async () => {
    if (user) {
      setIsHistoryLoading(true);
      const data = await getUserData(user.uid);
      setUserData(data);
      setIsHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  const questionHistory = useMemo(() => {
    if (!userData?.activity) return [];
    return userData.activity.filter(a => a.type === 'interview-question-set') as InterviewQuestionSetActivity[];
  }, [userData]);


  async function onSubmit(values: QuestionsGeneratorFormValues) {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You need to be logged in to generate questions." });
      return;
    }
    
    const usageCheck = await checkAndIncrementUsage(user.uid, 'aiEnhancements');
    if (!usageCheck.success) {
      toast({ title: "Usage Limit Reached", description: usageCheck.message, variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateInterviewQuestions(values);
      
      const activity: InterviewQuestionSetActivity = {
        id: `iq-set-${Date.now()}`,
        type: 'interview-question-set',
        timestamp: new Date().toISOString(),
        questions: result,
        details: {
            topic: values.role,
            role: values.role,
            level: values.level,
            company: values.company || 'N/A'
        }
      };

      await addActivity(user.uid, activity);
      
      router.push(`/dashboard/interview-questions-generator/results?id=${activity.id}`);
      
    } catch (e: any) {
      console.error("Failed to generate questions:", e);
      toast({ title: "Generation Failed", description: e.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <section className="relative text-center rounded-2xl p-8 md:p-12 overflow-hidden bg-gradient-to-br from-primary/80 to-blue-500/80 text-primary-foreground shadow-2xl mb-12">
           <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
           <div className="relative z-10">
                <div className="mx-auto bg-white/20 text-primary-foreground rounded-full p-4 w-fit mb-6">
                    <MessageSquare className="h-10 w-10" />
                </div>
                <h1 className="font-headline text-5xl font-bold tracking-tighter">AI Interview Questions Generator</h1>
                <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                    Generate tailored interview questions for any role, level, or technology stack to sharpen your preparation.
                </p>
           </div>
        </section>

        <section>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Sparkles className="w-6 h-6 text-primary"/> Generate New Questions</CardTitle>
                    <CardDescription>Specify the parameters to generate a new set of interview questions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Role</FormLabel>
                                            <FormControl><Input placeholder="e.g., Software Engineer" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Experience Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="entry-level">Entry-Level</SelectItem>
                                                    <SelectItem value="mid-level">Mid-Level</SelectItem>
                                                    <SelectItem value="senior">Senior</SelectItem>
                                                    <SelectItem value="principal">Principal / Staff</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                           </div>
                           <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Description</FormLabel>
                                        <FormControl><Textarea placeholder="Paste a brief job description here for more accurate questions..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Company (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., Google, Amazon" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="pt-4 text-right">
                                <Button type="submit" size="lg" disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isGenerating ? 'Generating...' : 'Generate Questions & Answers'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </section>
        
        <section className="mt-12">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><History className="w-6 h-6"/> Generation History</CardTitle>
                    <CardDescription>Review questions you've previously generated.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isHistoryLoading ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>
                            <p>Loading history...</p>
                        </div>
                    ) : questionHistory.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Generated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {questionHistory.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.details.role}</TableCell>
                                        <TableCell>{item.details.company || 'N/A'}</TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/interview-questions-generator/results?id=${item.id}`}>
                                                    <BarChart className="mr-2 h-4 w-4"/>
                                                    View Questions
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground p-8">You haven't generated any question sets yet.</p>
                    )}
                </CardContent>
            </Card>
        </section>
      </div>
    </main>
  );
}
