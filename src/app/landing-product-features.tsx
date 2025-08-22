
'use client';

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, BarChart, BookOpen, BrainCircuit, CalendarDays, Code, MessageSquare, Sparkles, User, Video } from "lucide-react";
import Image from "next/image";

const features = [
    {
        title: 'Your Personalized 30-Day Prep Plan',
        description: 'Start with a plan tailored to your target roles and companies. Our AI generates a comprehensive, 30-day syllabus covering everything from data structures to system design, ensuring you learn what matters most.',
        icon: CalendarDays,
        imageUrl: 'https://placehold.co/1200x800.png',
        dataAiHint: 'calendar planner',
    },
    {
        title: 'AI-Generated Study Notes',
        description: "Don't just memorize—understand. Select any topic from your syllabus, and our AI will generate a detailed, easy-to-digest study guide, complete with core concepts, key terminology, and practical code examples.",
        icon: BookOpen,
        imageUrl: 'https://placehold.co/1200x800.png',
        dataAiHint: 'notebook study',
    },
    {
        title: 'Interactive Coding Quizzes',
        description: 'Test your knowledge with AI-generated coding challenges. Write your solution in our editor and get instant, in-depth feedback on correctness, efficiency, and code style, along with an optimal solution.',
        icon: Code,
        imageUrl: 'https://placehold.co/1200x800.png',
        dataAiHint: 'code editor',
    },
    {
        title: 'Human-Like AI Interviews',
        description: "Experience a realistic, voice-based mock interview. Our conversational AI asks relevant technical and behavioral questions, listens to your answers, and responds dynamically, just like a real interviewer.",
        icon: MessageSquare,
        imageUrl: 'https://placehold.co/1200x800.png',
        dataAiHint: 'video call',
    },
    {
        title: 'In-Depth Performance Analytics',
        description: 'Track your progress with a comprehensive dashboard. Analyze your quiz scores over time, identify your weakest concepts, and review transcripts from past interviews to pinpoint areas for improvement.',
        icon: BarChart,
        imageUrl: 'https://placehold.co/1200x800.png',
        dataAiHint: 'dashboard charts',
    },
];

export default function LandingProductFeatures() {
  return (
    <section id="features" className="bg-background py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center">
          <Badge
            variant="outline"
            className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
          >
            Product Features
          </Badge>
          <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
            A Better Way to Prepare
          </h2>
          <p className="text-muted-foreground max-w-2xl text-center">
            Talxify combines a structured learning path with powerful AI tools to give you the ultimate interview prep experience.
          </p>
        </div>

        <div className="space-y-24">
            {features.map((feature, index) => (
                <div key={feature.title} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className={cn("prose prose-lg dark:prose-invert", index % 2 === 1 && "lg:order-2")}>
                         <div className="flex items-center gap-4 mb-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-full">
                                <feature.icon className="w-6 h-6"/>
                            </div>
                            <h3 className="m-0 font-headline text-3xl font-bold">{feature.title}</h3>
                         </div>
                         <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                    <div className={cn("flex items-center justify-center", index % 2 === 1 && "lg:order-1")}>
                        <div className="bg-card/50 rounded-xl border p-4 shadow-lg w-full">
                            <Image 
                                src={feature.imageUrl}
                                alt={feature.title}
                                width={1200}
                                height={800}
                                className="rounded-lg object-cover"
                                data-ai-hint={feature.dataAiHint}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
