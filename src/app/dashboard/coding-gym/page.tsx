
'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateCodingQuestions, GenerateCodingQuestionsInput, CodingQuestion } from '@/ai/flows/generate-coding-questions';
import { analyzeCodingAnswers, AnswerAnalysis } from '@/ai/flows/analyze-coding-answers';
import { Loader2, Sparkles, CheckCircle, XCircle, ChevronLeft, Trophy, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addActivity, checkAndIncrementUsage } from '@/lib/firebase-service';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { QuizResult } from '@/lib/types';


type Difficulty = 'easy' | 'moderate' | 'difficult';
type QuizStatus = 'idle' |'generating' | 'answering' | 'analyzing' | 'feedback' | 'finished';

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function CodingGymComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [analysis, setAnalysis] = useState<AnswerAnalysis | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [quizSubmissions, setQuizSubmissions] = useState<{question: CodingQuestion; userAnswer: string; analysis: AnswerAnalysis}[]>([]);
  const [consecutiveHardCorrect, setConsecutiveHardCorrect] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const hasStartedRef = useRef(false);

  const topic = useMemo(() => searchParams.get('topic') || '', [searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (status === 'answering') {
        interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
    } else {
        if(interval) clearInterval(interval);
    }
    return () => {
        if(interval) clearInterval(interval);
    };
  }, [status]);


  const fetchNextQuestion = useCallback(async (currentDifficulty: Difficulty) => {
    if (!user) {
       router.push('/login');
       return;
    }
    setStatus('generating');
    setTimer(0);

    // Only check usage on the very first question of a new session
    if (questionCount === 0) {
        const usageCheck = await checkAndIncrementUsage(user.uid);
        if (!usageCheck.success) {
            toast({ title: "Usage Limit Reached", description: usageCheck.message, variant: "destructive" });
            router.push('/dashboard/pricing');
            return;
        }
    }
    
    if (!topic) {
      toast({ title: 'Error', description: 'No topic specified for the gym.', variant: 'destructive' });
      router.back();
      return;
    }

    try {
      const input: GenerateCodingQuestionsInput = {
        topics: topic,
        language: 'JavaScript',
        difficulty: currentDifficulty,
        count: 1,
      };
      const result = await generateCodingQuestions(input);
      if (result.questions && result.questions.length > 0) {
          setQuestion(result.questions[0]);
          setUserAnswer('');
          setAnalysis(null);
          setQuestionCount(prev => prev + 1);
          setStatus('answering');
      } else {
           toast({ title: 'No More Questions', description: `The AI could not generate more ${currentDifficulty} questions for this topic. Finishing session.`, variant: 'destructive' });
           setStatus('finished');
           if (quizSubmissions.length > 0) saveQuizToActivity(quizSubmissions);
      }
    } catch (error) {
      console.error('Failed to generate coding questions:', error);
      toast({ title: 'Error', description: 'Failed to generate the next question. Please try again.', variant: 'destructive' });
      router.back();
    }
  }, [topic, router, toast, user, quizSubmissions, questionCount]);

  useEffect(() => {
    if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        fetchNextQuestion('easy');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  const handleSubmitAnswer = async () => {
    if (!question || !userAnswer) {
        toast({ title: 'No Answer', description: 'Please provide an answer before submitting.', variant: "destructive" });
        return;
    }
    setStatus('analyzing');

    try {
        const result = await analyzeCodingAnswers({ submissions: [{ question, userAnswer }]});
        if (result.analysis && result.analysis.length > 0) {
            const currentAnalysis = result.analysis[0];
            setAnalysis(currentAnalysis);
            setStatus('feedback');

            const newSubmissions = [...quizSubmissions, { question, userAnswer, analysis: currentAnalysis }];
            setQuizSubmissions(newSubmissions);
            
            // Difficulty and completion logic
            if (currentAnalysis.isCorrect) {
                 if (difficulty === 'difficult') {
                    const newCount = consecutiveHardCorrect + 1;
                    if (newCount >= 2) {
                        setStatus('finished');
                        saveQuizToActivity(newSubmissions);
                    }
                    setConsecutiveHardCorrect(newCount);
                } else if (difficulty === 'easy') {
                    setDifficulty('moderate');
                    setConsecutiveHardCorrect(0);
                } else if (difficulty === 'moderate') {
                    setDifficulty('difficult');
                    setConsecutiveHardCorrect(0);
                }
            } else {
                setConsecutiveHardCorrect(0);
                 if (difficulty === 'difficult') setDifficulty('moderate');
            }
        }
    } catch(err) {
        console.error(err);
        toast({ title: "Analysis Error", description: "Could not analyze your answer.", variant: "destructive"});
        setStatus('answering');
    }
  }

  const saveQuizToActivity = async (finalSubmissions: typeof quizSubmissions) => {
    if (!user || finalSubmissions.length === 0) return;

    const quizState = finalSubmissions.map(s => ({ question: s.question, userAnswer: s.userAnswer }));
    const analysisResults = finalSubmissions.map(s => s.analysis);
    const score = Math.round(analysisResults.reduce((sum, a) => sum + a.score, 0) / analysisResults.length * 100);

    const quizResult: QuizResult = {
        id: `izanami_${Date.now()}`,
        type: 'quiz',
        timestamp: new Date().toISOString(),
        quizState: quizState,
        analysis: analysisResults,
        topics: topic,
        difficulty: 'adaptive',
        details: {
            topic: topic,
            difficulty: 'Izanami Mode',
            score: `${score}%`,
        }
    };

    try {
      await addActivity(user.uid, quizResult);
      toast({ title: "Progress Saved", description: "Your Code Izanami session has been saved to your activity."});
    } catch (err) {
      console.error("Failed to save Izanami results:", err);
    }
  };

  const handleNext = () => {
    if (questionCount >= 10) {
        setStatus('finished');
        if (quizSubmissions.length > 0) saveQuizToActivity(quizSubmissions);
    } else {
        fetchNextQuestion(difficulty);
    }
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
         {/* Header & Progress */}
         <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/arena')}><ChevronLeft className="mr-2"/> Back to Arena</Button>
                <div className="text-center">
                    <h1 className="font-headline text-2xl font-bold">Code Izanami</h1>
                    <p className="text-muted-foreground text-sm capitalize">{topic}</p>
                </div>
                 <div className="flex items-center gap-4">
                    <Badge className="capitalize" variant={difficulty === 'easy' ? 'default' : difficulty === 'moderate' ? 'secondary' : 'destructive'}>{difficulty}</Badge>
                    <div className="flex items-center gap-2 text-muted-foreground font-mono">
                        <Timer className="h-4 w-4"/>
                        <span>{formatTime(timer)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg min-h-[60vh] flex flex-col">
            {(status === 'generating' || status === 'idle') && (
                 <CardContent className="flex flex-col items-center justify-center flex-grow text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
                    <p className="text-lg text-muted-foreground">Generating next question...</p>
                 </CardContent>
            )}

            {status === 'answering' && question && (
                <>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground">Question {questionCount}</CardTitle>
                    <CardDescription className="prose dark:prose-invert max-w-none text-foreground text-lg" dangerouslySetInnerHTML={{ __html: question.questionText }} />
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                    <Textarea
                        placeholder="Write your JavaScript code here..."
                        className="min-h-[300px] font-mono text-sm flex-grow"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSubmitAnswer}>Submit Answer</Button>
                </CardFooter>
                </>
            )}

            {status === 'analyzing' && (
                 <CardContent className="flex flex-col items-center justify-center flex-grow text-center">
                    <Sparkles className="h-12 w-12 text-primary mb-4 animate-pulse"/>
                    <p className="text-lg text-muted-foreground">Analyzing your solution...</p>
                 </CardContent>
            )}

            {status === 'feedback' && analysis && (
                 <CardContent className="p-6 space-y-6">
                    <div className={cn("p-4 rounded-lg border flex items-center gap-4", analysis.isCorrect ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50")}>
                        {analysis.isCorrect ? <CheckCircle className="w-8 h-8 text-green-500"/> : <XCircle className="w-8 h-8 text-red-500"/>}
                        <div>
                            <p className="text-xl font-bold">{analysis.isCorrect ? 'Correct!' : 'Needs Improvement'}</p>
                            <p className="font-semibold">Score: {Math.round(analysis.score * 100)}%</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">AI Feedback:</h3>
                        <div className="p-4 bg-background rounded-md border prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysis.feedback }}/>
                    </div>
                    {!analysis.isCorrect && (
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Correct Solution (JavaScript):</h3>
                            <pre className="p-4 bg-background rounded-md overflow-x-auto text-sm border font-mono"><code>{analysis.correctSolution}</code></pre>
                        </div>
                    )}
                     <div className="text-center pt-4">
                        <Button onClick={handleNext} size="lg">Next Question <ChevronLeft className="ml-2 rotate-180"/></Button>
                    </div>
                </CardContent>
            )}

             {status === 'finished' && (
                 <CardContent className="flex flex-col items-center justify-center flex-grow text-center p-6">
                    <Trophy className="w-16 h-16 text-yellow-500 mb-4"/>
                    <h2 className="text-3xl font-bold font-headline">Workout Complete!</h2>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        Great job! You've completed your training session. Your results have been saved to your activity log.
                    </p>
                    <div className="mt-4 p-4 rounded-lg bg-muted border w-full max-w-xs">
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <p className="text-4xl font-bold text-primary">{Math.round(quizSubmissions.reduce((sum, s) => sum + s.analysis.score, 0) / (quizSubmissions.length || 1) * 100)}%</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/arena')} className="mt-6">Back to Arena</Button>
                </CardContent>
            )}

        </Card>
      </div>
    </main>
  )
}

export default function CodingGymPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-primary" /></div>}>
            <CodingGymComponent />
        </Suspense>
    )
}
