
'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateCodingQuestions, GenerateCodingQuestionsInput, CodingQuestion } from '@/ai/flows/generate-coding-questions';
import { analyzeCodingAnswers, AnswerAnalysis } from '@/ai/flows/analyze-coding-answers';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertTriangle, Lightbulb, Sparkles, CheckCircle, XCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { checkAndIncrementUsage } from '@/lib/firebase-service';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Difficulty = 'easy' | 'moderate' | 'difficult';
type QuizStatus = 'generating' | 'answering' | 'analyzing' | 'feedback' | 'finished';

function CodingGymComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [analysis, setAnalysis] = useState<AnswerAnalysis | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionCount, setQuestionCount] = useState(0);
  const [status, setStatus] = useState<QuizStatus>('generating');
  
  const topic = useMemo(() => searchParams.get('topic') || '', [searchParams]);
  const SOFT_LIMIT = 10;

  const fetchNextQuestion = useCallback(async (currentDifficulty: Difficulty) => {
    if (!user) {
       router.push('/login');
       return;
    }
    setStatus('generating');

    const usageCheck = await checkAndIncrementUsage(user.uid);
    if (!usageCheck.success) {
        toast({ title: "Usage Limit Reached", description: usageCheck.message, variant: "destructive" });
        router.push('/dashboard/pricing');
        return;
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
          setStatus('answering');
          setQuestionCount(prev => prev + 1);
      } else {
           toast({ title: 'No More Questions', description: `The AI could not generate more ${currentDifficulty} questions for this topic.`, variant: 'destructive' });
           setStatus('finished');
      }
    } catch (error) {
      console.error('Failed to generate coding questions:', error);
      toast({ title: 'Error', description: 'Failed to generate the next question. Please try again.', variant: 'destructive' });
      router.back();
    }
  }, [topic, router, toast, user]);

  useEffect(() => {
    fetchNextQuestion('easy');
  }, [fetchNextQuestion]);
  

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

            if (questionCount >= SOFT_LIMIT) {
                setStatus('finished');
            } else if (currentAnalysis.score > 0.75) {
                if (difficulty === 'easy') setDifficulty('moderate');
                else if (difficulty === 'moderate') setDifficulty('difficult');
            }
        }
    } catch(err) {
        console.error(err);
        toast({ title: "Analysis Error", description: "Could not analyze your answer.", variant: "destructive"});
        setStatus('answering');
    }
  }

  const handleNext = () => {
    fetchNextQuestion(difficulty);
  }

  const progress = (questionCount / SOFT_LIMIT) * 100;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
         {/* Header & Progress */}
         <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/arena')}><ChevronLeft className="mr-2"/> Back to Arena</Button>
                <div className="text-center">
                    <h1 className="font-headline text-2xl font-bold">Code Izanami</h1>
                    <p className="text-muted-foreground text-sm capitalize">{topic}</p>
                </div>
                <Badge className="capitalize" variant={difficulty === 'easy' ? 'default' : difficulty === 'moderate' ? 'secondary' : 'destructive'}>{difficulty}</Badge>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
                Question {questionCount} of {SOFT_LIMIT}
            </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg min-h-[60vh] flex flex-col">
            {status === 'generating' && (
                 <CardContent className="flex flex-col items-center justify-center flex-grow text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
                    <p className="text-lg text-muted-foreground">Generating next question...</p>
                 </CardContent>
            )}

            {status === 'answering' && question && (
                <>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Question {questionCount}</CardTitle>
                    <CardDescription className="text-base">{question.questionText}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                    <Textarea
                        placeholder="Write your code here..."
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
                 <CardContent className="p-6 space-y-4">
                    <div className={cn("p-4 rounded-lg border flex items-center gap-4", analysis.isCorrect ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50")}>
                        {analysis.isCorrect ? <CheckCircle className="w-8 h-8 text-green-500"/> : <XCircle className="w-8 h-8 text-red-500"/>}
                        <div>
                            <p className="text-xl font-bold">{analysis.isCorrect ? 'Correct!' : 'Needs Improvement'}</p>
                            <p className="font-semibold">Score: {Math.round(analysis.score * 100)}%</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">AI Feedback:</h3>
                        <div className="p-4 bg-background rounded-md border">
                            <p>{analysis.feedback}</p>
                        </div>
                    </div>
                    {!analysis.isCorrect && (
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Correct Solution:</h3>
                            <pre className="p-4 bg-background rounded-md overflow-x-auto text-sm border font-mono"><code>{analysis.correctSolution}</code></pre>
                        </div>
                    )}
                     <div className="text-center pt-4">
                        <Button onClick={handleNext} size="lg">Next Question <ChevronRight className="ml-2"/></Button>
                    </div>
                </CardContent>
            )}

             {status === 'finished' && (
                 <CardContent className="flex flex-col items-center justify-center flex-grow text-center p-6">
                    <Trophy className="w-16 h-16 text-yellow-500 mb-4"/>
                    <h2 className="text-3xl font-bold font-headline">Workout Complete!</h2>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        Great job! You've completed your training session. Review your progress on the dashboard.
                    </p>
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
