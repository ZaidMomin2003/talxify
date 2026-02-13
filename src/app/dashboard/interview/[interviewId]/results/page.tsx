

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { generateInterviewFeedback } from '@/ai/flows/generate-interview-feedback';
import { useAuth } from '@/context/auth-context';
import { getActivity, updateActivity } from '@/lib/firebase-service';
import type { InterviewActivity, GenerateInterviewFeedbackOutput } from '@/lib/types';
import { AlertTriangle, BarChart3, Bot, BrainCircuit, Check, CheckCircle, ChevronLeft, Flag, Gauge, Info, Loader2, MessageSquare, Percent, Sparkles, Star, Target, TrendingUp, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

function ResultsLoader() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold">Analyzing Your Interview...</h2>
                <p className="max-w-md text-muted-foreground">Our AI Coach is reviewing your transcript to provide detailed feedback. This might take a moment.</p>
            </div>
        </div>
    )
}

function ResultsError({ message }: { message: string }) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Analysis Failed</CardTitle>
                    <CardDescription>
                        {message || "We couldn't find the interview or process the results. Please try again later or return to your dashboard."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <a href="/dashboard">Back to Dashboard</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

const ScoreGauge = ({ score = 0, label, icon: Icon, color }: { score?: number, label: string, icon: React.ElementType, color: string }) => {
    const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const offset = circumference - (validScore / 100) * circumference;
    const gradientId = `gradient-${label.replace(/\s+/g, '-')}`;

    return (
        <Card className={cn("relative flex flex-col items-center justify-center text-center p-6 overflow-hidden border-muted-foreground/10 bg-muted/5 backdrop-blur-sm rounded-[2rem]", color)}>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-current/5 via-transparent to-transparent opacity-50"></div>
            <div className="relative w-36 h-36">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="currentColor" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity={0.5} />
                        </linearGradient>
                    </defs>
                    <circle
                        className="opacity-10"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    <circle
                        strokeWidth="8"
                        strokeDasharray={circumference.toString()}
                        strokeDashoffset={offset.toString()}
                        strokeLinecap="round"
                        stroke={`url(#${gradientId})`}
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className="w-6 h-6 opacity-60 mb-1" />
                    <span className="text-4xl font-black tracking-tighter">{Math.round(validScore)}<span className="text-xl opacity-40">%</span></span>
                </div>
            </div>
            <p className="mt-4 text-[10px] uppercase font-black tracking-[0.2em] opacity-60">{label}</p>
        </Card>
    );
};


export default function InterviewResultsPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();

    const interviewId = params.interviewId as string;
    const [interview, setInterview] = useState<InterviewActivity | null>(null);
    const [analysis, setAnalysis] = useState<GenerateInterviewFeedbackOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const generateFeedback = useCallback(async (activity: InterviewActivity) => {
        try {
            const feedbackResult = await generateInterviewFeedback({
                transcript: activity.transcript,
                topic: activity.details.topic,
                role: activity.details.role || 'Software Engineer',
                company: activity.details.company || undefined,
            });

            setAnalysis(feedbackResult);

            const updatedActivity: InterviewActivity = {
                ...activity,
                analysis: feedbackResult,
                feedback: feedbackResult.summary,
                details: {
                    ...activity.details,
                    score: feedbackResult.crackingChance,
                }
            };
            if (user) {
                await updateActivity(user.uid, updatedActivity);
            }
        } catch (e: any) {
            console.error("Feedback generation failed:", e);
            setError(`AI feedback generation failed: ${e.message}`);
        }
    }, [user]);

    const fetchInterviewData = useCallback(async () => {
        if (!user || !interviewId) return;

        setIsLoading(true);
        setError(null);

        try {
            const userActivity = await getActivity(user.uid);
            const currentInterview = userActivity.find(a => a.id === interviewId && a.type === 'interview') as InterviewActivity | undefined;

            if (!currentInterview) {
                setError("Interview not found.");
                setIsLoading(false);
                return;
            }

            setInterview(currentInterview);

            if (currentInterview.analysis) {
                setAnalysis(currentInterview.analysis);
            } else {
                await generateFeedback(currentInterview);
            }

        } catch (e: any) {
            console.error("Error fetching interview data:", e);
            setError(`Failed to load interview data: ${e.message}`);
        } finally {
            setIsLoading(false);
        }

    }, [user, interviewId, generateFeedback]);

    useEffect(() => {
        fetchInterviewData();
    }, [fetchInterviewData]);

    if (isLoading) return <ResultsLoader />;
    if (error || !analysis || !interview) return <ResultsError message={error || "Could not retrieve analysis."} />;

    return (
        <main className="p-6 lg:p-10 overflow-auto min-h-screen relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary/80">AI Analysis Complete</span>
                    </div>
                </div>

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-indigo-600 to-blue-800 p-8 md:p-12 text-primary-foreground shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1 px-4 rounded-full text-xs font-bold tracking-wide">
                                {interview.details.topic} Simulation
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                                Performance <br />Report
                            </h1>
                            <p className="text-primary-foreground/70 max-w-md font-medium">
                                Comprehensive breakdown of your conversational flow and technical accuracy.
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-inner">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Cracking Chance</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-7xl font-black tracking-tighter text-white">{analysis.crackingChance}</span>
                                <span className="text-2xl font-black text-white/60">%</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/20 text-green-300 text-[10px] font-black uppercase tracking-widest border border-green-400/30">
                                <TrendingUp size={12} />
                                Technical Proficiency
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <ScoreGauge score={analysis.fluencyScore} label="Fluency" icon={MessageSquare} color="bg-blue-500/10 text-blue-500 border-blue-500/20" />
                    <ScoreGauge score={analysis.knowledgeScore} label="Tech Knowledge" icon={BrainCircuit} color="bg-orange-500/10 text-orange-500 border-orange-500/20" />
                    <ScoreGauge score={analysis.confidenceScore} label="Confidence" icon={Star} color="bg-pink-500/10 text-pink-500 border-pink-500/20" />
                </div>

                {/* Summary Card */}
                <Card className="border-muted-foreground/10 bg-muted/20 backdrop-blur-sm relative overflow-hidden rounded-[2rem]">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bot size={120} className="text-primary rotate-12" />
                    </div>
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            The Action Plan
                        </CardTitle>
                        <CardDescription className="text-base">AI-generated strategy for your upcoming real interview.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <p className="text-lg text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">
                            {analysis.summary}
                        </p>
                    </CardContent>
                </Card>

                {/* Concepts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-green-500/10 bg-green-500/5 backdrop-blur-sm rounded-[2rem]">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/20 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                Mastery Indicators
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="grid gap-3">
                                {(analysis.strongConcepts || []).map((concept, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-green-500/10 hover:border-green-500/30 transition-all">
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        <span className="font-bold text-foreground/80 text-sm capitalize">{concept}</span>
                                    </div>
                                ))}
                                {(!analysis.strongConcepts || analysis.strongConcepts.length === 0) && (
                                    <p className="text-sm text-muted-foreground italic opacity-60">Consolidating performance data...</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/10 bg-destructive/5 backdrop-blur-sm rounded-[2rem]">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                    <Target className="w-5 h-5" />
                                </div>
                                Growth Opportunities
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="grid gap-3">
                                {(analysis.weakConcepts || []).map((concept, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-destructive/10 hover:border-destructive/30 transition-all">
                                        <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                        <span className="font-bold text-foreground/80 text-sm capitalize">{concept}</span>
                                    </div>
                                ))}
                                {(!analysis.weakConcepts || analysis.weakConcepts.length === 0) && (
                                    <p className="text-sm text-muted-foreground italic opacity-60">No major gaps detected.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transcript Analysis */}
                {interview.transcript && interview.transcript.length > 0 && (
                    <div className="space-y-6 pt-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight font-headline uppercase leading-none">Full Transcript Review</h2>
                        </div>
                        <Card className="border-muted-foreground/10 bg-muted/10 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-8 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                <div className="space-y-6">
                                    {interview.transcript.map((entry, index) => (
                                        <div key={index} className={`flex items-start gap-4 ${entry.speaker === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-110",
                                                entry.speaker === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-background border border-muted-foreground/20 text-muted-foreground'
                                            )}>
                                                {entry.speaker === 'ai' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                            </div>
                                            <div className={cn(
                                                "rounded-[1.5rem] p-5 max-w-[80%] relative group transition-all duration-300",
                                                entry.speaker === 'user'
                                                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/10 rounded-tr-none'
                                                    : 'bg-background border border-muted-foreground/10 text-foreground rounded-tl-none hover:border-primary/20'
                                            )}>
                                                <div className={cn(
                                                    "text-[10px] font-black tracking-widest uppercase mb-1 opacity-50",
                                                    entry.speaker === 'user' ? 'text-right' : 'text-left'
                                                )}>
                                                    {entry.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                                                </div>
                                                <p className="leading-relaxed font-medium">{entry.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </main>
    );
}
