
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Linkedin, Instagram, Mail, Phone, Code, Briefcase, Percent, Twitter, Globe, Target, Eye, Users, FileText } from "lucide-react";
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
            <section className="relative pt-32 pb-20 sm:pt-40 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-0 right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto max-w-4xl px-4 md:px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 leading-[0.8] text-foreground">
                            Our <span className="text-primary">Story.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg sm:text-xl font-medium italic text-muted-foreground leading-relaxed">
                            We're here to bridge the gap between learning and landing your dream job with the power of AI. Experience the evolution of interview prep.
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-20 max-w-5xl">
                {/* Mission and Vision Grid */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 dark:border-white/10 bg-card/40 dark:bg-black/40 backdrop-blur-xl p-10 shadow-2xl transition-all duration-500 hover:border-primary/30"
                    >
                        <div className="flex items-center gap-4 text-primary mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                                <Target className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Why We're Here</h2>
                        </div>
                        <p className="text-muted-foreground font-medium italic text-lg leading-relaxed">We give you the real-world practice and tools you need to walk into any interview with total confidence and land your dream offer.</p>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 dark:border-white/10 bg-card/40 dark:bg-black/40 backdrop-blur-xl p-10 shadow-2xl transition-all duration-500 hover:border-primary/30"
                    >
                        <div className="flex items-center gap-4 text-primary mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                                <Eye className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Our Dream</h2>
                        </div>
                        <p className="text-muted-foreground font-medium italic text-lg leading-relaxed">We're building a world where every developer gets a fair shot at success, no matter where they start or what their background is.</p>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </motion.div>
                </div>

                {/* Stats Spotlight */}
                <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
                    {[
                        { label: 'Interviews Completed', value: '870+', sub: 'Across our platform', icon: Briefcase },
                        { label: 'Coding Solutions', value: '4,000+', sub: 'Solutions submitted', icon: Code },
                        { label: 'Notes Generated', value: '5,000+', sub: 'And growing every day', icon: FileText }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-[2rem] border-border dark:border-white/10 bg-card/20 dark:bg-white/[0.02] p-8 text-center backdrop-blur-md relative group hover:bg-card/40 transition-all duration-500"
                        >
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="text-3xl font-black italic tracking-tighter text-foreground leading-none mb-1">{stat.value}</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-2">{stat.label}</p>
                            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{stat.sub}</p>
                        </motion.div>
                    ))}
                </section>

                {/* About the Founder - Redesigned Spotlight */}
                <section className="relative pt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] border border-primary/20 bg-primary/5 dark:bg-black/40 backdrop-blur-3xl p-8 sm:p-12 shadow-2xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <Briefcase size={280} className="text-primary" />
                        </div>

                        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center relative z-10">
                            <div className="md:col-span-5 flex flex-col gap-6">
                                <div className="relative group w-full">
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10 rounded-[2.5rem]" />
                                    <div className="relative w-full aspect-[4/5] rounded-[2.5rem] border border-primary/20 overflow-hidden shadow-2xl">
                                        <Image
                                            src="/about.jpg"
                                            alt="Arshad (Zaid) Momin"
                                            width={600}
                                            height={750}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-1 leading-none">Arshad Momin</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Founder & Lead Engineer</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl bg-white/5 border-white/10 hover:bg-primary hover:border-primary transition-all group gap-2" asChild>
                                        <a href="https://www.linkedin.com/in/arshad-momin-a3139b21b/" target="_blank" rel="noopener noreferrer">
                                            <Linkedin className="w-4 h-4 group-hover:text-white" />
                                            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white">LinkedIn</span>
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl bg-white/5 border-white/10 hover:bg-primary hover:border-primary transition-all group gap-2" asChild>
                                        <a href="https://www.instagram.com/fallen_zaid/" target="_blank" rel="noopener noreferrer">
                                            <Instagram className="w-4 h-4 group-hover:text-white" />
                                            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white">Instagram</span>
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            <div className="md:col-span-7 flex flex-col gap-8">
                                <div className="space-y-4">
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic w-fit">Founder's Intelligence</span>
                                    <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-foreground leading-[0.85]">Empowering the <br /><span className="text-primary">Next Generation.</span></h3>
                                </div>
                                <blockquote className="text-lg sm:text-xl font-medium italic text-muted-foreground/80 leading-relaxed pl-6 border-l-2 border-primary/30">
                                    "I saw too many talented people struggle to land the jobs they deserved, simply because they lacked the right kind of practice. I built Talxify to be the bridge to your success. My goal is to help you walk into every interview with the skills to shine."
                                </blockquote>
                                <div className="pt-2">
                                    <Button asChild className="h-16 px-10 rounded-2xl bg-primary hover:scale-105 transition-all font-black uppercase tracking-widest italic text-base shadow-2xl shadow-primary/30">
                                        <Link href="/#pricing">Join the Mission</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Testimonial Section Removed */}

            </main>

            <LandingFooter />
        </div>
    );
}
