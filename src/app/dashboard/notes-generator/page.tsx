
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BookOpen, Sparkles, Loader2, History } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getUserData } from '@/lib/firebase-service';
import type { UserData, NoteGenerationActivity } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const notesGeneratorSchema = z.object({
    topic: z.string().min(3, { message: "Please enter a topic." }),
});

type NotesGeneratorFormValues = z.infer<typeof notesGeneratorSchema>;

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
};

export default function NotesGeneratorPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const form = useForm<NotesGeneratorFormValues>({
        resolver: zodResolver(notesGeneratorSchema),
        defaultValues: {
            topic: '',
        },
    });

    const fetchUserData = useCallback(async () => {
        if (user) {
            setIsDataLoading(true);
            const data = await getUserData(user.uid);
            setUserData(data);
            setIsDataLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const notesHistory = useMemo(() => {
        if (!userData || !userData.activity) return [];
        return (userData.activity.filter(a => a.type === 'note-generation') as NoteGenerationActivity[])
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [userData]);

    function onSubmit(values: NotesGeneratorFormValues) {
        if (!user) {
            toast({
                title: "Not Authenticated",
                description: "You need to be logged in to generate notes.",
                variant: "destructive"
            });
            router.push('/login');
            return;
        }
        router.push(`/dashboard/arena/notes?topic=${encodeURIComponent(values.topic)}`);
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 -mt-20 -ml-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 -mb-20 -mr-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-5xl mx-auto space-y-12 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tight italic uppercase text-foreground leading-none">
                        Genius <span className="text-primary">Notes</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground text-lg font-medium">
                        Master any technical concept. Our AI synthesizes comprehensive, easy-to-digest study guides for your preparation.
                    </motion.p>
                </div>

                <section>
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                    New Knowledge Base
                                </CardTitle>
                                <CardDescription className="text-base">Enter the technical topic or technology stack you want to master.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Learning Topic</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Kafka Architecture, React Performance, Docker Internals" {...field} className="bg-muted/50 dark:bg-black/20 border-border dark:border-white/5 h-14 focus:ring-primary/20 rounded-2xl text-lg px-6" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="pt-4 flex justify-end">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs italic shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all min-w-[240px]"
                                            >
                                                Generate Masterclass
                                                <Sparkles className="ml-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>

                <section>
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-white/5">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <History className="w-6 h-6 text-primary" />
                                    Knowledge Vault
                                </CardTitle>
                                <CardDescription className="text-base">Revisit your previously generated study guides and deep dives.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isDataLoading ? (
                                    <div className="p-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary opacity-50" />
                                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing vault...</p>
                                    </div>
                                ) : notesHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted dark:bg-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">Topic</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Generated On</TableHead>
                                                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {notesHistory.map(note => (
                                                    <TableRow key={note.id} className="group border-b-border dark:border-b-white/5 hover:bg-primary/5 transition-all duration-300">
                                                        <TableCell className="py-6 px-8">
                                                            <span className="font-bold text-foreground group-hover:text-primary transition-colors block capitalize text-lg tracking-tight">
                                                                {note.details.topic}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="py-6 text-muted-foreground text-sm">
                                                            {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                                                        </TableCell>
                                                        <TableCell className="text-right py-6 px-8">
                                                            <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all px-5">
                                                                <Link href={`/dashboard/arena/notes?topic=${encodeURIComponent(note.details.topic)}`}>
                                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                                    Review Notes
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="p-20 text-center space-y-4 opacity-30">
                                        <BookOpen className="w-16 h-16 mx-auto" />
                                        <p className="font-black uppercase tracking-[0.2em] text-sm">Vault is Empty</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>
            </motion.div>
        </main>
    );
}
