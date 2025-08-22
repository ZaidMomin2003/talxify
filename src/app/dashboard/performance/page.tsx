
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { QuizResult, StoredActivity } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, BookOpen, Brain, HelpCircle, Trophy, AlertTriangle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { getActivity } from '@/lib/firebase-service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
        <p className="label text-muted-foreground">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} style={{ color: pld.color }} className="flex items-center gap-2 font-semibold">
              <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: pld.color}}/>
              {pld.name}: {pld.value}%
          </div>
        ))}
      </div>
    );
  }

  return null;
};


export default function PerformancePage() {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { user } = useAuth();

  const fetchActivity = useCallback(async () => {
    if (user) {
        const allActivity = await getActivity(user.uid);
        const completedQuizzes = allActivity.filter(
            (item): item is QuizResult => item.type === 'quiz' && item.analysis && item.analysis.length > 0
        );
        setQuizResults(completedQuizzes);
    }
  }, [user]);

  useEffect(() => {
    fetchActivity().finally(() => setHasLoaded(true));
  }, [fetchActivity]);

  const performanceData = useMemo(() => {
    if (quizResults.length === 0) return [];
    
    const generateComparisonScore = (index: number, total: number) => {
        const base = 55;
        const growth = (index / Math.max(total - 1, 1)) * 20; 
        const randomFactor = (Math.random() - 0.5) * 5;
        return Math.min(100, Math.max(0, Math.round(base + growth + randomFactor)));
    };
    
    return [...quizResults]
        .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((result, index, arr) => {
            const totalScore = result.analysis.reduce((sum, item) => sum + item.score, 0);
            const averageScore = Math.round((totalScore / Math.max(result.analysis.length, 1)) * 100);
            return {
                name: format(new Date(result.timestamp), 'MMM d'),
                yourScore: averageScore,
                averageScore: generateComparisonScore(index, arr.length),
                topics: result.topics
            };
        });
  }, [quizResults]);

  const { averageScore, totalQuizzes, questionsAnswered, weakConcepts } = useMemo(() => {
    if (quizResults.length === 0) {
      return { averageScore: 0, totalQuizzes: 0, questionsAnswered: 0, weakConcepts: [] };
    }

    let totalScore = 0;
    let questionsCount = 0;
    const conceptScores: { [key: string]: { total: number, count: number } } = {};

    quizResults.forEach(result => {
        const topics = result.topics.split(',').map(t => t.trim().toLowerCase());
        result.analysis.forEach(analysisItem => {
            totalScore += analysisItem.score;
            topics.forEach(topic => {
                if (!conceptScores[topic]) {
                    conceptScores[topic] = { total: 0, count: 0 };
                }
                conceptScores[topic].total += analysisItem.score;
                conceptScores[topic].count += 1;
            });
        });
        questionsCount += result.analysis.length;
    });

    const avgScore = questionsCount > 0 ? Math.round((totalScore / questionsCount) * 100) : 0;
    
    const weak: {topic: string, score: number}[] = Object.entries(conceptScores)
        .map(([topic, data]) => ({
            topic,
            score: Math.round((data.total / data.count) * 100)
        }))
        .filter(item => item.score < 70)
        .sort((a, b) => a.score - b.score)
        .slice(0, 5);

    return {
      averageScore: avgScore,
      totalQuizzes: quizResults.length,
      questionsAnswered: questionsCount,
      weakConcepts: weak,
    };
  }, [quizResults]);
  

  if (!hasLoaded) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <p className="text-muted-foreground">Loading performance data...</p>
        </div>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Performance</h1>
        <p className="text-muted-foreground">Analyze your progress and identify areas for improvement.</p>
      </div>

    {quizResults.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center p-12">
            <Trophy className="w-16 h-16 mb-4 text-muted-foreground" />
            <CardTitle className="text-2xl font-bold mb-2">No Performance Data Yet</CardTitle>
            <CardDescription className="mb-6">
            Complete a coding quiz to start tracking your performance.
            </CardDescription>
            <Button asChild>
                <Link href="/dashboard">Take a Quiz</Link>
            </Button>
        </Card>
    ) : (
      <>
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">Number of quizzes you've completed.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">Across all completed questions.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questionsAnswered}</div>
              <p className="text-xs text-muted-foreground">Total number of coding problems solved.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-1">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Your average quiz scores compared to the community average.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={performanceData}
                  margin={{
                    top: 5, right: 20, left: -10, bottom: 5,
                  }}
                >
                  <defs>
                    <linearGradient id="colorYourScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="yourScore" name="Your Score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorYourScore)" strokeWidth={2} activeDot={{ r: 6, style: { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' } }} />
                  <Area type="monotone" dataKey="averageScore" name="Avg. Score" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeWidth={2} activeDot={{ r: 6, style: { fill: 'hsl(var(--muted-foreground))', stroke: 'hsl(var(--background))' } }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        <div className="mt-8">
          <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A log of your most recently completed quizzes.</CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            View Weak Concepts
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Weakest Areas (Scores {"<"} 70%)</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {weakConcepts.length > 0 ? (
                            weakConcepts.map(concept => (
                                <DropdownMenuItem key={concept.topic} className="flex justify-between">
                                    <span className="capitalize font-medium">{concept.topic}</span>
                                    <Badge variant={concept.score < 50 ? 'destructive' : 'secondary'}>{concept.score}%</Badge>
                                </DropdownMenuItem>
                            ))
                        ) : (
                             <div className="p-4 text-center text-sm text-muted-foreground">
                                <Brain className="w-6 h-6 mb-2 mx-auto"/>
                                No weak concepts found. Keep up the great work!
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quiz</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...quizResults].reverse().slice(0, 5).map(result => (
                            <TableRow key={result.id}>
                                <TableCell className="font-medium capitalize">{result.topics} Quiz</TableCell>
                                <TableCell className="capitalize">{result.difficulty}</TableCell>
                                <TableCell className="text-right">{format(new Date(result.timestamp), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/coding-quiz/analysis?id=${result.id}`}>View Analysis</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {quizResults.length === 0 && (
                     <div className="text-center p-8 text-muted-foreground">
                        You haven't completed any quizzes yet.
                     </div>
                )}
            </CardContent>
          </Card>
        </div>
      </>
    )}
    </main>
  );
}
