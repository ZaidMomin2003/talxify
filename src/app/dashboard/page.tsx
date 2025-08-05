
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Code, Briefcase, Percent } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";

const codingAssistantSchema = z.object({
  topics: z.string().min(1, "Topics are required."),
  difficulty: z.enum(["easy", "moderate", "difficult"]),
  numQuestions: z.coerce.number().min(1, "Please enter a number of questions.").max(10, "You can request a maximum of 10 questions."),
});

export default function DashboardPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof codingAssistantSchema>>({
    resolver: zodResolver(codingAssistantSchema),
    defaultValues: {
      topics: "",
      difficulty: "easy",
      numQuestions: 3,
    },
  });

  function onSubmit(values: z.infer<typeof codingAssistantSchema>) {
    const params = new URLSearchParams({
        topics: values.topics,
        difficulty: values.difficulty,
        numQuestions: String(values.numQuestions),
    });
    router.push(`/dashboard/coding-quiz/instructions?${params.toString()}`);
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
        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mock Interview</CardTitle>
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Simulate a real-time interview with an AI.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
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
                   <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
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
                  <FormField
                    control={form.control}
                    name="numQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Number of questions to practice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" size="lg" variant="secondary">
                  Start Coding
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </main>
  );
}
