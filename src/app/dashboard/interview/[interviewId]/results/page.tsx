

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { generateInterviewFeedback } from '@/ai/flows/generate-interview-feedback';
import { useAuth } from '@/context/auth-context';
import { getActivity, updateActivity } from '@/lib/firebase-service';
import type { InterviewActivity, GenerateInterviewFeedbackOutput } from '@/lib/types';
import { AlertTriangle, BarChart3, Bot, BrainCircuit, Check, CheckCircle, ChevronLeft, Flag, Gauge, Info, Loader2, MessageSquare, Percent, Sparkles, Star, Target, TrendingUp, User as UserIcon, Activity, Cpu, Terminal, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function ResultsLoader() {
    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        "Analyzing speech patterns...",
        "Evaluating technical accuracy...",
        "Processing behavioral responses...",
        "Measuring conversational fluency...",
        "Generating final evaluation report..."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % statuses.length);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 bg-zinc-950 relative overflow-hidden font-sans">
            {/* Animated Background Layers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent)] pointer-events-none" />

            <div className="flex flex-col items-center gap-12 text-center relative z-10">
                <div className="relative flex items-center justify-center">
                    {/* Ring Animations */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border-t-2 border-b-2 border-primary/30"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute w-24 h-24 rounded-full border-l-2 border-r-2 border-primary/50"
                    />

                    <div className="absolute flex items-center justify-center">
                        <BrainCircuit className="h-10 w-10 text-primary animate-pulse" />
                    </div>

                    {/* Subtle Glow */}
                    <div className="absolute inset-0 bg-primary/10 blur-3xl animate-pulse" />
                </div>

                <div className="space-y-4 max-w-xs">
                    <motion.div
                        key={statusIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="h-6"
                    >
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {statuses[statusIndex]}
                        </h2>
                    </motion.div>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                        Please wait while our AI engine compiles your detailed performance metrics and technical audit.
                    </p>
                </div>

                {/* Progress Bar (Indeterminate) */}
                <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                        animate={{
                            x: [-192, 192],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-full h-full bg-primary"
                    />
                </div>
            </div>
        </div>
    )
}

function ResultsError({ message }: { message: string }) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 bg-zinc-950">
            <Card className="max-w-md w-full text-center border-white/5 bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl">
                <div className="mx-auto bg-red-500/10 text-red-500 rounded-2xl p-4 w-fit mb-6">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2">Evaluation Failed</CardTitle>
                <CardDescription className="text-zinc-400 mb-8">
                    {message || "We encountered an issue processing your interview results."}
                </CardDescription>
                <Button asChild className="w-full h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border-white/5">
                    <a href="/dashboard">Return to Dashboard</a>
                </Button>
            </Card>
        </div>
    );
}

const ScoreGauge = ({ score = 0, label, icon: Icon, color }: { score?: number, label: string, icon: React.ElementType, color: string }) => {
    const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (validScore / 100) * circumference;

    return (
        <Card className="relative flex flex-col items-center justify-center text-center p-8 border-white/5 bg-zinc-900/50 backdrop-blur-sm rounded-[2rem] transition-all duration-300 hover:border-white/10 group">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        className="text-zinc-800"
                        strokeWidth="6"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        stroke="currentColor"
                        className={cn("transition-all duration-500", color)}
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white tracking-tighter">{Math.round(validScore)}%</span>
                </div>
            </div>

            <div className="mt-4 flex flex-col items-center gap-1">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
                <Icon className={cn("w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity", color)} />
            </div>
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
        <main className="p-4 sm:p-8 lg:p-12 overflow-auto min-h-screen relative font-sans bg-zinc-950 text-zinc-300">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto space-y-12 relative z-10"
            >
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Exit to Dashboard
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/5 shadow-xl">
                        <Activity className="h-3 w-3 text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Official Report</span>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-8">
                    <div className="space-y-6 text-center md:text-left">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none py-1 px-4 rounded-full text-xs font-bold tracking-tight">
                            {interview.details.topic} Interview Assessment
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
                            Technical Evaluation <br /> <span className="text-zinc-500">Statement.</span>
                        </h1>
                        <p className="text-zinc-400 max-w-lg font-medium text-lg leading-relaxed">
                            This report provides a granular breakdown of your performance, technical expertise, and role compatibility.
                        </p>
                    </div>

                    <Card className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-zinc-900 border-white/5 shadow-2xl relative">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Overall Score</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-7xl font-black tracking-tighter text-white">{analysis.crackingChance}</span>
                            <span className="text-2xl font-bold text-primary">%</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-widest border border-white/5">
                            Confidence Index
                        </div>
                    </Card>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <ScoreGauge score={analysis.fluencyScore} label="Fluency" icon={MessageSquare} color="text-blue-500" />
                    <ScoreGauge score={analysis.knowledgeScore} label="Domain Expertise" icon={BrainCircuit} color="text-orange-500" />
                    <ScoreGauge score={analysis.confidenceScore} label="Communication" icon={Star} color="text-pink-500" />
                </div>

                {/* Summary Card */}
                <Card className="border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-bold text-white tracking-tight">Executive Summary</h3>
                        </div>
                        <p className="text-lg text-zinc-400 leading-relaxed font-medium whitespace-pre-wrap">
                            {analysis.summary}
                        </p>
                    </div>
                </Card>

                {/* Concepts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-3 text-white tracking-tight">
                                <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                Key Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {(analysis.strongConcepts || []).map((concept, i) => (
                                    <Badge key={i} variant="outline" className="border-white/5 bg-zinc-800 text-zinc-300 py-1.5 px-4 rounded-xl text-xs font-medium">
                                        {concept}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-3 text-white tracking-tight">
                                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                                    <Target className="w-5 h-5" />
                                </div>
                                Areas for Development
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {(analysis.weakConcepts || []).map((concept, i) => (
                                    <Badge key={i} variant="outline" className="border-white/5 bg-zinc-800 text-zinc-300 py-1.5 px-4 rounded-xl text-xs font-medium">
                                        {concept}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transcript Analysis */}
                {interview.transcript && interview.transcript.length > 0 && (
                    <div className="space-y-6 pt-12 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <MessageSquare className="h-5 w-5 text-zinc-500" />
                            <h2 className="text-2xl font-bold text-white tracking-tight">Conversation History</h2>
                        </div>

                        <div className="space-y-6">
                            {interview.transcript.map((entry, index) => (
                                <div key={index} className={`flex flex-col gap-2 ${entry.speaker === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                            {entry.speaker === 'ai' ? 'Interviewer' : 'Candidate'}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "rounded-2xl p-4 max-w-[85%] text-sm font-medium leading-relaxed",
                                        entry.speaker === 'user'
                                            ? 'bg-primary text-black font-bold'
                                            : 'bg-zinc-900 border border-white/5 text-zinc-300'
                                    )}>
                                        {entry.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </main>
    );
}
