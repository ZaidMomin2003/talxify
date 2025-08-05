import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Code, Briefcase, Percent } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Here's your progress overview, welcome back!</p>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary/20">
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
                <Label htmlFor="role">Role</Label>
                <Input id="role" placeholder="e.g., Software Engineer" />
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" placeholder="e.g., React, System Design" />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" size="lg" disabled>
              <Link href="#">Start Interview</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Coding Assistant</CardTitle>
              <Code className="h-6 w-6 text-accent" />
            </div>
            <CardDescription>Get AI-powered help with your coding problems.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <form className="space-y-4">
              <div>
                <Label htmlFor="coding-topics">Topics</Label>
                <Input id="coding-topics" placeholder="e.g., JavaScript, Algorithms" />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" size="lg" variant="secondary" disabled>
              <Link href="#">Start Coding</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track your improvement over time.</CardDescription>
          </CardHeader>
          <CardContent>
              <Image 
                  src="https://placehold.co/1200x400.png" 
                  alt="Performance chart placeholder"
                  width={1200}
                  height={400}
                  className="w-full h-auto rounded-lg"
                  data-ai-hint="data visualization chart"
              />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
