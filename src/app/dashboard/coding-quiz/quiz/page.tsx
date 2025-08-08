
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateCodingQuestions, GenerateCodingQuestionsInput, CodingQuestion } from '@/ai/flows/generate-coding-questions';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type QuizState = {
    question: CodingQuestion;
    userAnswer: string;
}[];

export default function CodingQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const topics = useMemo(() => searchParams.get('topics') || '', [searchParams]);
  const difficulty = useMemo(() => searchParams.get('difficulty') || 'easy', [searchParams]);
  const numQuestions = useMemo(() => parseInt(searchParams.get('numQuestions') || '3', 10), [searchParams]);

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      if (!topics) {
        toast({
          title: 'Error',
          description: 'No topics specified for the quiz.',
          variant: 'destructive',
        });
        router.back();
        return;
      }

      try {
        const input: GenerateCodingQuestionsInput = {
          taskDescription: `Generate ${numQuestions} coding questions about ${topics}`,
          language: 'JavaScript',
          difficulty: difficulty as any,
          count: numQuestions
        };
        const result = await generateCodingQuestions(input);
        if (result.questions && result.questions.length > 0) {
            setQuestions(result.questions);
            setUserAnswers(new Array(result.questions.length).fill(''));

            // Create placeholder in localStorage
            const attemptId = `quiz_attempt_${Date.now()}`;
            sessionStorage.setItem('currentQuizAttemptId', attemptId);
        } else {
             toast({
                title: 'No Questions',
                description: 'The AI could not generate questions for the selected topic. Please try another one.',
                variant: 'destructive',
            });
            router.back();
        }
      } catch (error) {
        console.error('Failed to generate coding questions:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate coding questions. Please try again.',
          variant: 'destructive',
        });
        router.back();
      } finally {
        setIsLoading(false);
      }
    }

    if (topics && difficulty && numQuestions > 0) {
      fetchQuestions();
    }
  }, [topics, difficulty, numQuestions, router, toast]);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = () => {
    const quizState: QuizState = questions.map((q, i) => ({
      question: q,
      userAnswer: userAnswers[i],
    }));
    
    sessionStorage.setItem('quizResults', JSON.stringify(quizState));
    sessionStorage.setItem('quizTopics', topics);
    sessionStorage.setItem('quizDifficulty', difficulty);
    router.push('/dashboard/coding-quiz/analysis');
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Generating your quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p className="text-muted-foreground">Could not load questions. Please go back and try again.</p>
         <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
                Question {currentQuestionIndex + 1} of {questions.length}
            </p>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Question {currentQuestionIndex + 1}</CardTitle>
            <CardDescription className="text-base">{currentQuestion.questionText}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your code here..."
              className="min-h-[300px] font-code text-sm"
              value={userAnswers[currentQuestionIndex]}
              onChange={handleAnswerChange}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={finishQuiz}>Finish Quiz</Button>
            ) : (
              <Button onClick={goToNextQuestion}>Next</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
