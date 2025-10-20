
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Linkedin, Instagram, Mail, Phone, Code, Briefcase, Percent, Twitter, Globe, Target, Eye, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { TestimonialCard } from "@/app/landing-testimonials";
import { Button } from "@/components/ui/button";
import LandingHeader from "../landing-header";
import LandingFooter from "../landing-footer";

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'SDE at a Bangalore startup',
    description: (
      <p>
        Talxify was a game-changer for my prep.
        The AI mock interviews felt incredibly realistic.
      </p>
    ),
  },
  {
    name: 'Rohan Gupta',
    role: 'Frontend Developer at Wipro',
    description: (
      <p>
        The AI coding assistant is brilliant.
        It helps you understand the logic.
      </p>
    ),
  },
  {
    name: 'Ananya Reddy',
    role: 'CS Student at IIT Bombay',
    description: (
      <p>
        Getting relevant interview practice is tough for campus placements.
        Talxify's targeted quizzes were perfect.
      </p>
    ),
  },
  {
    name: 'Vikram Singh',
    role: 'Backend Engineer at Infosys',
    description: (
      <p>
        I used Talxify to prepare for a senior role.
        The system design questions were spot-on.
      </p>
    ),
  },
];


const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));


export default function AboutUsPage() {
    return (
        <div className="bg-background min-h-screen text-foreground">
            <LandingHeader />
            {/* Hero Section */}
            <section className="relative bg-primary/5 pt-20 sm:pt-28 text-center">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background/80 to-background blur-sm"></div>
                <div className="container mx-auto max-w-4xl px-4 md:px-6 relative py-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold mb-4">About Talxify</h1>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                        We are on a mission to bridge the gap between talent and opportunity, empowering the next generation of software engineers to achieve their career goals.
                    </p>
                </div>
            </section>

            <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-20 max-w-5xl">
                {/* Mission and Vision */}
                <section className="grid md:grid-cols-2 gap-12 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-primary">
                            <Target className="w-8 h-8"/>
                            <h2 className="text-3xl font-bold font-headline">Our Mission</h2>
                        </div>
                        <p className="text-muted-foreground">To provide aspiring software engineers with the most effective and accessible tools to master their technical interview skills, build their confidence, and land their dream jobs.</p>
                    </div>
                    <div className="space-y-4">
                         <div className="flex items-center justify-center md:justify-start gap-3 text-primary">
                            <Eye className="w-8 h-8"/>
                            <h2 className="text-3xl font-bold font-headline">Our Vision</h2>
                        </div>
                        <p className="text-muted-foreground">To create a world where every aspiring developer has the opportunity to showcase their true potential, regardless of their background, by democratizing access to high-quality interview preparation.</p>
                    </div>
                </section>

                 {/* Stats Section */}
                <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">870+</div>
                            <p className="text-xs text-muted-foreground">Across our platform</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Coding Questions Solved</CardTitle>
                            <Code className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4,000+</div>
                            <p className="text-xs text-muted-foreground">Solutions submitted</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Happy Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5,000+</div>
                            <p className="text-xs text-muted-foreground">And growing every day</p>
                        </CardContent>
                    </Card>
                </section>

                {/* About the Founder */}
                <section>
                    <Card className="overflow-hidden shadow-lg border-primary/10">
                        <div className="grid md:grid-cols-3 items-center">
                            <div className="md:col-span-1">
                                <Image src="/about.jpg" alt="Arshad (Zaid) Momin" width={400} height={400} className="w-full h-full object-cover" data-ai-hint="person portrait" />
                            </div>
                            <div className="md:col-span-2 p-8 space-y-4">
                                <h3 className="text-lg font-semibold text-primary">A Note from the Founder</h3>
                                <h2 className="text-3xl font-bold font-headline">Arshad (Zaid) Momin</h2>
                                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                                    "I saw too many brilliant students struggle to land the jobs they deserved, not because they lacked talent, but because they lacked the right kind of practice. I built Talxify to be the bridge between academic knowledge and real-world interview success. My goal is to empower every developer to walk into their interviews with the confidence and skills to shine."
                                </blockquote>
                                <div className="flex items-center gap-4 pt-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href="https://www.linkedin.com/in/arshad-momin-a3139b21b/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile"><Linkedin /></a>
                                    </Button>
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href="https://www.instagram.com/zaidwontdo/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Profile"><Instagram /></a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Testimonials */}
                <section className="text-center">
                    <h2 className="text-4xl font-bold font-headline mb-4">What Our Users Say</h2>
                    <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
                        We're proud to have helped so many developers on their journey.
                    </p>
                    <div className="relative mt-12 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg">
                        <Marquee pauseOnHover className="[--duration:20s]">
                        {firstRow.map((testimonial) => (
                            <TestimonialCard key={testimonial.name} {...testimonial} />
                        ))}
                        </Marquee>
                        <Marquee reverse pauseOnHover className="[--duration:20s]">
                        {secondRow.map((testimonial) => (
                            <TestimonialCard key={testimonial.name} {...testimonial} />
                        ))}
                        </Marquee>
                        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r"></div>
                        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l"></div>
                    </div>
                </section>

            </main>

            <LandingFooter />
        </div>
    );
}
