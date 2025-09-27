
'use client';

import { CalendarDays, Code, User, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
    {
        icon: CalendarDays,
        step: 1,
        title: "Get a Personalized Plan",
        description: "Answer a few questions about your career goals, and our AI will generate a custom 60-day prep syllabus tailored just for you."
    },
    {
        icon: Code,
        step: 2,
        title: "Practice & Learn",
        description: "Follow your daily tasks, including AI-powered mock interviews, targeted coding quizzes, and in-depth study notes to master key concepts."
    },
    {
        icon: User,
        step: 3,
        title: "Showcase Your Skills",
        description: "As you complete challenges, your portfolio is automatically updated. Build a professional resume and share your progress with recruiters."
    }
];

export default function LandingHowItWorks() {
    return (
        <section className="bg-transparent py-16 sm:py-24">
            <div className="container mx-auto max-w-6xl px-4 md:px-6">
                <div className="mb-12 flex flex-col items-center">
                    <Badge
                        variant="outline"
                        className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
                    >
                        How It Works
                    </Badge>
                    <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
                        Your Path to Success in 3 Simple Steps
                    </h2>
                    <p className="text-muted-foreground max-w-2xl text-center">
                        We provide a clear, structured journey to get you from preparing to hired.
                    </p>
                </div>
                
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 hidden md:block"></div>
                     <div className="absolute top-0 left-1/2 w-px h-full bg-border -translate-x-1/2 md:hidden"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center">
                            <div className="relative z-10 flex items-center justify-center h-16 w-16 rounded-full bg-background border-2 border-primary shadow-lg">
                                <step.icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mt-6 mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
