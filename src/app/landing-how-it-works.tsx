
'use client';

import { CalendarDays, Code, User, Rocket, BookOpen, MessageSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
    {
        icon: CalendarDays,
        step: 1,
        title: "Get Your Plan",
        description: "Generate a personalized 60-day syllabus based on your target roles and companies to create your prep Arena."
    },
    {
        icon: BookOpen,
        step: 2,
        title: "Learn & Practice",
        description: "Study from AI-generated notes and test your knowledge with adaptive 'Code Izanami' quizzes for any topic."
    },
    {
        icon: MessageSquare,
        step: 3,
        title: "Master Interviews",
        description: "Practice with our conversational AI that simulates real-world technical and behavioral interviews."
    },
    {
        icon: FileText,
        step: 4,
        title: "Showcase & Succeed",
        description: "Build a professional resume and portfolio, automatically updated with your progress, to share with recruiters."
    }
];

export default function LandingHowItWorks() {
    return (
        <section className="bg-transparent py-16 sm:py-24">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mb-12 flex flex-col items-center">
                    <Badge
                        variant="outline"
                        className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
                    >
                        How It Works
                    </Badge>
                    <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
                        Your Path to Success, Simplified
                    </h2>
                    <p className="text-muted-foreground max-w-2xl text-center">
                        We provide a clear, structured journey to get you from preparing to hired.
                    </p>
                </div>
                
                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <div className="absolute top-8 left-0 w-full h-px bg-border hidden lg:block"></div>
                     <div className="absolute top-0 left-8 w-px h-full bg-border md:hidden"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center md:items-start md:text-left">
                            <div className="relative z-10 flex items-center justify-center h-16 w-16 rounded-full bg-background border-2 border-primary shadow-lg mb-6">
                                <step.icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
