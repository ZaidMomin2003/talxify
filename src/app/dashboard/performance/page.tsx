
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { QuizResult } from '../coding-quiz/analysis/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, BookOpen, Brain, Eye, HelpCircle } from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

export default function PerformancePage() {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedResults = localStorage.getItem('allQuizResults');
      if (storedResults) {
        setQuizResults(JSON.parse(storedResults));
      }
    }
  }, []);

  const performanceData = useMemo(() => {
    return quizResults
        .map(result => {
            const totalScore = result.analysis.reduce((sum, item) => sum + item.score, 0);
            const averageScore = Math.round((totalScore / result.analysis.length) * 100);
            return {
                name: format(new Date(result.timestamp), 'MMM d'),
                score: averageScore,
                topics: result.topics
            };
        })
        .reverse();
  }, [quizResults]);

  const { averageScore, totalQuizzes, questionsAnswered, weakConcepts } = useMemo(() => {
    if (quizResults.length === 0) {
      return { averageScore: 0, totalQuizzes: 0, questionsAnswered: 0, weakConcepts: [] };
    }

    let totalScore = 0;
    let questionsCount = 0;
    const conceptScores: { [key: string]: { total: number, count: number } } = {};

    quizResults.forEach(result => {
        const topics = result.topics.split(',').map(t => t.trim());
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

    const avgScore = Math.round((totalScore / questionsCount) * 100);
    
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

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Performance</h1>
        <p className="text-muted-foreground">Analyze your progress and identify areas for improvement.</p>
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Number of times your portfolio was viewed. (Dummy data)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Your average quiz scores over your last few sessions.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                   />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weak Concepts</CardTitle>
            <CardDescription>Topics where your average score is below 70%.</CardDescription>
          </CardHeader>
          <CardContent>
            {weakConcepts.length > 0 ? (
                <ul className="space-y-3">
                    {weakConcepts.map(concept => (
                        <li key={concept.topic} className="flex items-center justify-between">
                            <span className="capitalize font-medium">{concept.topic}</span>
                            <Badge variant={concept.score < 50 ? 'destructive' : 'secondary'}>{concept.score}%</Badge>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                    <Brain className="w-8 h-8 mb-2"/>
                    <p>No weak concepts found. Keep up the great work!</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of your most recently completed quizzes.</CardDescription>
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
                    {quizResults.slice(0, 5).map(result => (
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
    </main>
  );
}
