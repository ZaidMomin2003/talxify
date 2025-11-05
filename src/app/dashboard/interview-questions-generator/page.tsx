
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MessageSquare, Sparkles, Loader2, History } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getUserData } from '@/lib/firebase-service';
import type { UserData } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const questionsGeneratorSchema = z.object({
  role: z.string().min(2, "Please enter a job role."),
  level: z.string().min(2, "Please enter a job level."),
  technologies: z.string().min(2, "Please enter at least one technology."),
});

type QuestionsGeneratorFormValues = z.infer<typeof questionsGeneratorSchema>;

export default function InterviewQuestionsGeneratorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDataLoading, setIsDataLoading] = useState(true);

  const form = useForm<QuestionsGeneratorFormValues>({
    resolver: zodResolver(questionsGeneratorSchema),
    defaultValues: {
      role: '',
      level: '',
      technologies: '',
    },
  });

  useEffect(() => {
    if (user) {
      setIsDataLoading(false);
    }
  }, [user]);

  function onSubmit(values: QuestionsGeneratorFormValues) {
    toast({
        title: "Coming Soon!",
        description: "This feature is currently under development. Stay tuned!",
    });
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                            <FormLabel>Level</FormLabel>
                                            <FormControl><Input placeholder="e.g., Mid-Level, Senior" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="technologies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Technologies</FormLabel>
                                            <FormControl><Input placeholder="e.g., React, Go, Docker" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="pt-4 text-right">
                                <Button type="submit" size="lg">Generate Questions</Button>
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
                     <p className="text-center text-muted-foreground p-8">This feature is coming soon. Your history will appear here.</p>
                </CardContent>
            </Card>
        </section>
      </div>
    </main>
  );
}
