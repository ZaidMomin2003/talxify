
'use client';

import { CalendarDays, Code, User, Rocket, BookOpen, MessageSquare, FileText, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
    {
        icon: BrainCircuit,
        step: 1,
        title: "Generate Practice Material",
        description: "Create tailored interview questions, study notes, or coding quizzes based on the role and company you're targeting."
    },
    {
        icon: MessageSquare,
        step: 2,
        title: "Practice with AI",
        description: "Use the generated material to practice. Engage in mock interviews, solve coding problems, and study key concepts."
    },
    {
        icon: FileText,
        step: 3,
        title: "Build Your Profile",
        description: "Craft a professional resume and build a portfolio to showcase your skills and preparation progress to recruiters."
    },
    {
        icon: Rocket,
        step: 4,
        title: "Land Your Dream Job",
        description: "Apply for jobs with confidence, backed by rigorous, AI-powered preparation and a standout professional profile."
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
