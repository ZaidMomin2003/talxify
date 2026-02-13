'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Bug, Upload, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function BugReportPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [description, setDescription] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            toast({
                title: "Error",
                description: "Please provide a description of the bug.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        toast({
            title: "Report Submitted",
            description: "Thank you for helping us improve Talxify!",
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    if (isSubmitted) {
        return (
            <main className="min-h-screen bg-muted/30 p-6 flex items-center justify-center">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

                <Card className="max-w-md w-full border-primary/10 bg-muted/20 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 text-center relative z-10 overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-bounce">
                            <CheckCircle2 size={40} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Report Received!</h2>
                    <p className="text-muted-foreground font-medium mb-8">
                        Our engineering team has been notified. We appreciate your contribution to making Talxify better.
                    </p>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                        Back to Dashboard
                    </Button>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-muted/30 p-6 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-bold"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/80">Beta Support</span>
                    </div>
                </div>

                <div className="space-y-4 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                        Report a <br /><span className="text-primary italic">Bug</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl font-medium">
                        Found something that isn't working as expected? Tell us about it and we'll squash it.
                    </p>
                </div>

                <Card className="border-primary/10 bg-muted/20 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Bug size={120} className="text-primary rotate-12" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <Bug className="h-6 w-6" />
                                </div>
                                Issue Details
                            </CardTitle>
                            <CardDescription className="text-base">Provide as much detail as possible to help us reproduce the issue.</CardDescription>
                        </CardHeader>

                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">
                                    What happened?
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the bug, steps to reproduce, and expected vs actual behavior..."
                                    className="min-h-[200px] bg-background/50 border-primary/10 focus:border-primary/30 focus:ring-primary/20 rounded-2xl p-4 text-base font-medium leading-relaxed resize-none shadow-inner"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="screenshot" className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">
                                    Visual Evidence (Optional)
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        id="screenshot"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="screenshot"
                                        className={cn(
                                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300",
                                            fileName
                                                ? "border-primary/40 bg-primary/5 text-primary"
                                                : "border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground"
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center p-6">
                                            {fileName ? (
                                                <>
                                                    <CheckCircle2 className="w-8 h-8 mb-2" />
                                                    <p className="text-sm font-bold truncate max-w-[250px]">{fileName}</p>
                                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-50 mt-1">Click to change</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 mb-2 opacity-50" />
                                                    <p className="text-sm font-bold">Upload screenshot</p>
                                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mt-1">PNG, JPG up to 10MB</p>
                                                </>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-8 bg-muted/30 border-t border-primary/5">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                size="lg"
                                className="w-full rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 h-14 hover:scale-[1.01] active:scale-95 transition-all group"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        Submit Report
                                        <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-muted-foreground font-medium opacity-50">
                    Talxify respects your privacy. Data provided here is used exclusively for debugging.
                </p>
            </div>
        </main>
    );
}
