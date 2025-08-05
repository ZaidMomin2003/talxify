import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Code, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Here's your progress overview, welcome back!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mock Interview</CardTitle>
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Simulate a real-time interview with an AI.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Mock Interview"
              width={600}
              height={400}
              className="rounded-lg object-cover aspect-video"
              data-ai-hint="person video call"
            />
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
            <Image
              src="https://placehold.co/600x400.png"
              alt="Coding Assistant"
              width={600}
              height={400}
              className="rounded-lg object-cover aspect-video"
              data-ai-hint="code editor"
            />
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" size="lg" variant="secondary" disabled>
              <Link href="#">Start Coding</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1 flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Review your past sessions.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Frontend Interview</p>
                <p className="text-sm text-muted-foreground">Completed 2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Algorithm Challenge</p>
                <p className="text-sm text-muted-foreground">Completed 4 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">System Design Mock</p>
                <p className="text-sm text-muted-foreground">Completed 1 week ago</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>View All Activity</Button>
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
