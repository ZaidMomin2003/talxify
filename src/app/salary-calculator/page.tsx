
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateSalaryEstimation, type GenerateSalaryEstimationOutput } from '@/ai/flows/generate-salary-estimation';
import { GenerateSalaryEstimationInputSchema, type GenerateSalaryEstimationInput } from '@/lib/types/salary';
import LandingHeader from '../landing-header';
import LandingFooter from '../landing-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Loader2, Sparkles, BrainCircuit, AlertTriangle, TrendingUp, LocateFixed, Briefcase, UserRound, Building2, MapPin, Search, ChevronRight, Wallet, Target, Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const ResultPlaceholder = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center mb-8 shadow-2xl"
        >
            <Wallet className="w-8 h-8 text-primary/50" />
        </motion.div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground/40 leading-none">
            Ready to <span className="text-primary/20">Analyze</span>
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 mt-4 max-w-[200px]">
            Enter your details to see your estimated salary.
        </p>
    </div>
)

function SalaryResult({ result }: { result: GenerateSalaryEstimationOutput }) {
    const formatCurrency = (amount: number, currency: string) => {
        try {
            return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch (e) {
            return `${currency} ${amount.toLocaleString()}`;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 sm:p-12 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.1),transparent_70%)]" />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-6 italic">Estimated Salary</p>
                    <div className="mb-2">
                        <span className="text-6xl sm:text-8xl font-black italic tracking-tighter text-foreground leading-none">
                            {formatCurrency(result.estimatedSalary, result.currency)}
                        </span>
                    </div>
                    <p className="text-primary font-bold uppercase tracking-widest text-xs italic opacity-80">{result.currency} / YEAR</p>

                    <div className="mt-12 grid grid-cols-2 gap-4 border-t border-primary/10 pt-8">
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Minimum Range</p>
                            <p className="text-xl font-black italic text-foreground/80">{formatCurrency(result.salaryRangeMin, result.currency)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Maximum Range</p>
                            <p className="text-xl font-black italic text-foreground/80">{formatCurrency(result.salaryRangeMax, result.currency)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles size={80} className="text-primary" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 italic flex items-center gap-2">
                    <Target className="w-3 h-3" /> Detailed Analysis
                </h4>
                <p className="text-xs font-medium text-muted-foreground leading-loose italic">
                    {result.justification}
                </p>
            </div>
        </motion.div>
    );
}

export default function SalaryCalculatorPage() {
    const [result, setResult] = useState<GenerateSalaryEstimationOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<GenerateSalaryEstimationInput>({
        resolver: zodResolver(GenerateSalaryEstimationInputSchema),
        defaultValues: {
            role: '',
            experience: 0,
            skills: '',
            location: '',
            companySize: 'mid-size',
        },
    });

    const onSubmit = async (values: GenerateSalaryEstimationInput) => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const estimation = await generateSalaryEstimation(values);
            setResult(estimation);
        } catch (e: any) {
            console.error(e);
            setError('Failed to calculate. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black min-h-screen text-white selection:bg-primary/30">
            <LandingHeader />

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150 mix-blend-overlay" />
            </div>

            <main className="relative z-10 pt-32 pb-40">
                <div className="container mx-auto px-4 md:px-6">

                    {/* Split Screen Layout */}
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">

                        {/* Title Section (Left) */}
                        <div className="lg:w-1/3 lg:sticky lg:top-44 space-y-8">
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-6xl sm:text-7xl font-black italic tracking-tighter uppercase leading-[0.85] mb-6"
                                >
                                    Salary <br /> <span className="text-primary">Calculator</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-muted-foreground font-medium italic text-lg leading-relaxed opacity-60"
                                >
                                    Get an AI-powered estimate of your market value. Enter your role and details to see what you should be earning.
                                </motion.p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-4">
                                {[
                                    { icon: BrainCircuit, label: "AI Analysis" },
                                    { icon: Network, label: "Market Data" },
                                    { icon: LocateFixed, label: "Location Based" }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 italic"
                                    >
                                        <stat.icon size={14} className="text-primary/30" />
                                        {stat.label}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Vertical Divider (Desktop) */}
                        <div className="hidden lg:block w-px h-[600px] bg-gradient-to-b from-white/5 via-white/10 to-transparent sticky top-44" />

                        {/* Form Section (Right) */}
                        <div className="lg:w-3/5 w-full space-y-12">

                            <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-8 sm:p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                    <Briefcase size={200} />
                                </div>

                                <div className="mb-10 flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <h2 className="text-xs font-black uppercase tracking-[0.4em] italic text-muted-foreground">Enter Your Details</h2>
                                </div>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormField
                                                control={form.control}
                                                name="role"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-3 block opacity-60">Job Role</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Frontend Developer" {...field} className="bg-transparent border-0 border-b-2 border-white/5 rounded-0 h-12 px-0 font-bold italic text-xl focus:border-primary transition-all placeholder:opacity-20 shadow-none ring-0 focus-visible:ring-0" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="experience"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-3 block opacity-60">Experience (Years)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} className="bg-transparent border-0 border-b-2 border-white/5 rounded-0 h-12 px-0 font-bold italic text-xl focus:border-primary transition-all shadow-none ring-0 focus-visible:ring-0" onChange={e => {
                                                                const val = e.target.value;
                                                                field.onChange(val === "" ? 0 : parseInt(val, 10));
                                                            }} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="skills"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-3 block opacity-60">Your Skills</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. React, Node.js" {...field} className="bg-transparent border-0 border-b-2 border-white/5 rounded-0 h-12 px-0 font-bold italic text-xl focus:border-primary transition-all placeholder:opacity-20 shadow-none ring-0 focus-visible:ring-0" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="location"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-3 block opacity-60">Your Location</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Mumbai, India" {...field} className="bg-transparent border-0 border-b-2 border-white/5 rounded-0 h-12 px-0 font-bold italic text-xl focus:border-primary transition-all placeholder:opacity-20 shadow-none ring-0 focus-visible:ring-0" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="companySize"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-3 block opacity-60">Company Size</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-transparent border-0 border-b-2 border-white/5 rounded-0 h-12 px-0 font-bold italic text-xl focus:border-primary transition-all shadow-none ring-0 focus-visible:ring-0">
                                                                <SelectValue placeholder="Size" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-zinc-900 border-white/10 rounded-3xl italic font-bold">
                                                            <SelectItem value="startup" className="rounded-2xl focus:bg-primary/10">Startup</SelectItem>
                                                            <SelectItem value="mid-size" className="rounded-2xl focus:bg-primary/10">Mid-sized Company</SelectItem>
                                                            <SelectItem value="large-enterprise" className="rounded-2xl focus:bg-primary/10">Large Enterprise</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="pt-8">
                                            <Button type="submit" size="lg" className="h-20 w-full rounded-[2rem] bg-primary text-primary-foreground font-black italic uppercase tracking-[0.3em] text-sm shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-50 group origin-center" disabled={isLoading}>
                                                {isLoading ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <TrendingUp className="mr-4 h-6 w-6" />}
                                                {isLoading ? 'Calculating...' : 'Calculate My Salary'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>

                            {/* Result Section */}
                            <div className="w-full relative">
                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-20 text-center space-y-6"
                                        >
                                            <div className="relative inline-block">
                                                <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
                                                <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Analyzing market data...</p>
                                        </motion.div>
                                    ) : error ? (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="p-12 bg-red-950/20 border border-red-500/20 rounded-[3rem] text-center"
                                        >
                                            <AlertTriangle className="h-10 w-10 mx-auto text-red-500 mb-6" />
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">Error</h3>
                                            <Button variant="destructive" className="rounded-2xl font-black uppercase italic tracking-widest h-12" onClick={() => setError(null)}>Try Again</Button>
                                        </motion.div>
                                    ) : result ? (
                                        <SalaryResult key="result" result={result} />
                                    ) : (
                                        <ResultPlaceholder key="placeholder" />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
