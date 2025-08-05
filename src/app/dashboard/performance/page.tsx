
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { QuizResult } from '../coding-quiz/analysis/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, BookOpen, Brain, Eye, HelpCircle, TrendingUp, Bookmark } from 'lucide-react';
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

const demoQuizResults: QuizResult[] = [
    {
        id: 'demo_quiz_1',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        topics: 'JavaScript',
        difficulty: 'easy',
        quizState: [
            { question: { questionText: 'What is a closure?' }, userAnswer: 'A function with access to its outer scope.' },
            { question: { questionText: 'Explain prototypal inheritance.' }, userAnswer: 'Objects can inherit from other objects.' }
        ],
        analysis: [
            { isCorrect: true, feedback: 'Good start.', score: 0.8, correctSolution: 'A closure is a function that remembers the environment in which it was created.' },
            { isCorrect: true, feedback: 'Correct, but could be more detailed.', score: 0.7, correctSolution: 'Prototypal inheritance is a feature in JavaScript where objects can have a "prototype" object, which acts as a template object that it inherits methods and properties from.' }
        ]
    },
    {
        id: 'demo_quiz_2',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        topics: 'React',
        difficulty: 'moderate',
        quizState: [
            { question: { questionText: 'What is the virtual DOM?' }, userAnswer: 'A copy of the DOM in memory.' },
            { question: { questionText: 'What are React Hooks?' }, userAnswer: 'Functions that let you use state and other React features in functional components.' }
        ],
        analysis: [
            { isCorrect: true, feedback: 'A good, concise answer.', score: 0.9, correctSolution: 'The virtual DOM (VDOM) is a programming concept where a virtual representation of a UI is kept in memory and synced with the "real" DOM by a library such as React DOM.' },
            { isCorrect: true, feedback: 'Excellent explanation.', score: 1.0, correctSolution: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components.' }
        ]
    },
    {
        id: 'demo_quiz_4',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        topics: 'CSS',
        difficulty: 'easy',
        quizState: [
            { question: { questionText: 'What is the box model?' }, userAnswer: 'It\'s about content, padding, border, and margin.' }
        ],
        analysis: [
            { isCorrect: true, feedback: 'Correct and to the point.', score: 0.9, correctSolution: 'The CSS box model is a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content.' }
        ]
    },
    {
        id: 'demo_quiz_3',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        topics: 'Algorithms',
        difficulty: 'moderate',
        quizState: [
            { question: { questionText: 'What is Big O notation?' }, userAnswer: 'It describes algorithm complexity.' }
        ],
        analysis: [
            { isCorrect: false, feedback: 'This is too vague. Be more specific.', score: 0.4, correctSolution: 'Big O notation is a mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.' }
        ]
    }
];


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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedResults = localStorage.getItem('allQuizResults');
      if (storedResults && JSON.parse(storedResults).length > 0) {
        setQuizResults(JSON.parse(storedResults));
      } else {
        setQuizResults(demoQuizResults);
      }
      setHasLoaded(true);
    }
  }, []);

  const performanceData = useMemo(() => {
    const generateComparisonScore = (index: number, total: number) => {
        const base = 55;
        const growth = (index / Math.max(total - 1, 1)) * 20; // grows from 0 to 20
        const randomFactor = (Math.random() - 0.5) * 5;
        return Math.min(100, Math.max(0, Math.round(base + growth + randomFactor)));
    };

    return quizResults
        .map((result, index, arr) => {
            const totalScore = result.analysis.reduce((sum, item) => sum + item.score, 0);
            const averageScore = Math.round((totalScore / Math.max(result.analysis.length, 1)) * 100);
            return {
                name: format(new Date(result.timestamp), 'MMM d'),
                yourScore: averageScore,
                averageScore: generateComparisonScore(index, arr.length),
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
  
  const bookmarkedConcepts = [
    { title: 'JavaScript Closures', link: '#' },
    { title: 'React State Management', link: '#' },
    { title: 'CSS Flexbox vs. Grid', link: '#' },
  ];

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

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Bookmarked Concepts</CardTitle>
            <CardDescription>Concepts you've saved for future study.</CardDescription>
          </CardHeader>
          <CardContent>
             {bookmarkedConcepts.length > 0 ? (
                <ul className="space-y-3">
                    {bookmarkedConcepts.map(concept => (
                        <li key={concept.title} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                           <div className='flex items-center gap-3'>
                             <Bookmark className="w-4 h-4 text-primary" />
                             <span className="capitalize font-medium">{concept.title}</span>
                           </div>
                           <Button asChild variant="secondary" size="sm">
                             <Link href={concept.link}>Review</Link>
                           </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                    <Bookmark className="w-8 h-8 mb-2"/>
                    <p>You haven't bookmarked any concepts yet.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

    </main>
  );
}
