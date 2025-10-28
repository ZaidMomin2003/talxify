
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, BrainCircuit, Code, Users, BarChart, Zap, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const upcomingFeatures = [
    {
        icon: BrainCircuit,
        title: 'Advanced Algorithm Tracks',
        description: 'Deep dive into complex topics like dynamic programming, graphs, and advanced data structures with guided lessons.'
    },
    {
        icon: Code,
        title: 'Real-World Project Building',
        description: 'Apply your skills by building curated, real-world projects from scratch with our step-by-step guidance.'
    },
    {
        icon: Users,
        title: 'Peer Mock Interviews',
        description: 'Connect with other users to conduct peer-to-peer mock interviews and give each other feedback.'
    },
    {
        icon: BarChart,
        title: 'Competitive Leaderboards',
        description: 'See how you stack up against other developers on weekly and monthly coding challenges.'
    }
];


export default function LevelUpPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="relative text-center rounded-2xl p-8 md:p-12 overflow-hidden bg-gradient-to-br from-primary/80 to-blue-500/80 text-primary-foreground shadow-2xl mb-12">
           <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
           <div className="relative z-10">
                <div className="mx-auto bg-white/20 text-primary-foreground rounded-full p-4 w-fit mb-6">
                    <Rocket className="h-10 w-10" />
                </div>
                <h1 className="font-headline text-5xl font-bold tracking-tighter">Level Up Your Coding Skills</h1>
                <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                    A new suite of advanced tools and challenges is currently in development to help you transition from a proficient developer to an exceptional one.
                </p>
           </div>
        </section>

        {/* Coming Soon Features */}
        <section>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline">What to Expect</h2>
                <p className="text-muted-foreground mt-2">Here's a sneak peek at what we're building.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {upcomingFeatures.map((feature, index) => (
                    <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/30 shadow-lg">
                        <CardHeader className="flex flex-row items-start gap-4">
                            <div className="bg-primary/10 text-primary rounded-lg p-3">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle>{feature.title}</CardTitle>
                                <CardDescription>{feature.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
                                <Lock className="w-4 h-4"/>
                                <span>Coming Soon</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-20">
             <Card className="max-w-2xl mx-auto bg-muted/40 border-dashed p-8">
                 <h3 className="text-2xl font-bold font-headline mb-2">You'll Be the First to Know</h3>
                 <p className="text-muted-foreground mb-6">As a Pro member, you'll get immediate access to all 'Level Up' features the moment they are released. Stay tuned for updates!</p>
                 <Button disabled size="lg">
                    <Zap className="mr-2 h-4 w-4"/>
                    Launching Soon
                 </Button>
            </Card>
        </section>

      </div>
    </main>
  );
}
