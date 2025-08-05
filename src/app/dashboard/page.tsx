
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Code, Briefcase, Percent, Search, RefreshCw, BarChart, Info } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import type { QuizResult } from "./coding-quiz/analysis/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

const codingAssistantSchema = z.object({
  topics: z.string().min(1, "Topics are required."),
  difficulty: z.enum(["easy", "moderate", "difficult"]),
});

export default function DashboardPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof codingAssistantSchema>>({
    resolver: zodResolver(codingAssistantSchema),
    defaultValues: {
      topics: "",
      difficulty: "easy",
    },
  });

  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedResults = localStorage.getItem('allQuizResults');
      if (storedResults) {
        setRecentQuizzes(JSON.parse(storedResults));
      }
    }
  }, []);

  function onSubmit(values: z.infer<typeof codingAssistantSchema>) {
    const params = new URLSearchParams({
        topics: values.topics,
        difficulty: values.difficulty,
        numQuestions: "3",
    });
    router.push(`/dashboard/coding-quiz/instructions?${params.toString()}`);
  }

  const filteredQuizzes = useMemo(() => {
    return recentQuizzes.filter(quiz => 
        quiz.topics.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentQuizzes, searchQuery]);

  const getOverallScore = (analysis: QuizResult['analysis']) => {
    if (!analysis || analysis.length === 0) return 0;
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    return Math.round((totalScore / analysis.length) * 100);
  };

  const handleRetakeQuiz = (quiz: QuizResult) => {
     const params = new URLSearchParams({
        topics: quiz.topics,
        difficulty: quiz.difficulty,
        numQuestions: String(quiz.quizState.length),
    });
    router.push(`/dashboard/coding-quiz/instructions?${params.toString()}`);
  }

  const handleInfoClick = (quiz: QuizResult) => {
    setSelectedQuiz(quiz);
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Here's your progress overview, welcome back!</p>
      </div>

      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Coding Questions Solved</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57</div>
            <p className="text-xs text-muted-foreground">+10 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Likelihood</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Based on your performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mock Interview</CardTitle>
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Simulate a real-time interview with an AI.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <form className="space-y-4">
               <div>
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" placeholder="e.g., React, System Design" />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-grow">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="e.g., Software Engineer" />
                </div>
                 <Button asChild size="lg" disabled>
                    <Link href="#">Start Interview</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border-accent/20">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Coding Assistant</CardTitle>
                  <Code className="h-6 w-6 text-accent" />
                </div>
                <CardDescription>Get AI-powered help with your coding problems.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                  <FormField
                    control={form.control}
                    name="topics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topics</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., JavaScript, Algorithms" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end gap-4">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormLabel>Difficulty</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="difficult">Difficult</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <Button type="submit" size="lg" variant="secondary">
                      Start Coding
                    </Button>
                  </div>
              </CardContent>
            </form>
          </Form>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Review your past coding quizzes and retake them to improve.</CardDescription>
            <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by topic or difficulty..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead className="hidden md:table-cell">Difficulty</TableHead>
                        <TableHead className="hidden md:table-cell text-center">Score</TableHead>
                        <TableHead className="hidden md:table-cell text-center">Result</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                            <TableCell className="font-medium capitalize">{quiz.topics}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant={
                                    quiz.difficulty === 'easy' ? 'default' :
                                    quiz.difficulty === 'moderate' ? 'secondary' : 'destructive'
                                } className="capitalize">{quiz.difficulty}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center font-semibold">
                                {getOverallScore(quiz.analysis)}%
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/dashboard/coding-quiz/analysis?id=${quiz.id}`}>View</Link>
                                </Button>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => handleRetakeQuiz(quiz)}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Dialog onOpenChange={(open) => !open && setSelectedQuiz(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => handleInfoClick(quiz)}>
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                You haven't taken any quizzes yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {selectedQuiz && (
              <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="capitalize">{selectedQuiz.topics} Quiz Details</DialogTitle>
                    <DialogDescription>
                      Review the details of your past quiz attempt.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge variant={
                          selectedQuiz.difficulty === 'easy' ? 'default' :
                          selectedQuiz.difficulty === 'moderate' ? 'secondary' : 'destructive'
                      } className="capitalize">{selectedQuiz.difficulty}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-semibold">{getOverallScore(selectedQuiz.analysis)}%</span>
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-start gap-2">
                     <Button asChild variant="outline">
                        <Link href={`/dashboard/coding-quiz/analysis?id=${selectedQuiz.id}`} onClick={() => setSelectedQuiz(null)}>View Full Analysis</Link>
                    </Button>
                    <Button onClick={() => { handleRetakeQuiz(selectedQuiz); setSelectedQuiz(null); }}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retake Quiz
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>

    </main>
  );
}
