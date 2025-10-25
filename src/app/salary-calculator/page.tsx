
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
import { DollarSign, Loader2, Sparkles, BrainCircuit, AlertTriangle, TrendingUp, LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';


const ResultPlaceholder = () => (
    <div className="relative h-full w-full flex items-center justify-center rounded-2xl bg-muted/30 p-8 overflow-hidden border">
        <div className="absolute -bottom-1/3 -right-1/3 w-2/3 h-2/3 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -top-1/4 -left-1/4 w-2/3 h-2/3 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
            <div className="mx-auto w-fit rounded-full bg-background/50 p-4 border mb-6">
                 <DollarSign className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Your Salary Estimate Awaits</h3>
            <p className="text-muted-foreground mt-2 max-w-xs">Fill in your details, and our AI will analyze market data to provide a personalized salary projection.</p>
        </div>
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
    } catch(e) {
        // Fallback for unsupported currency codes
        return `${currency} ${amount.toLocaleString()}`;
    }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center rounded-2xl p-8 overflow-hidden bg-gradient-to-br from-primary/80 to-blue-500/80 text-primary-foreground shadow-2xl">
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        <div className="relative text-center z-10 space-y-6">
            <div>
                <p className="text-lg font-medium text-primary-foreground/80">Estimated Annual Salary</p>
                <p className="text-6xl font-bold tracking-tighter">{formatCurrency(result.estimatedSalary, result.currency)}</p>
                <p className="font-semibold">{result.currency} / year</p>
            </div>
             <div className="text-lg text-primary-foreground/90">
                Likely Range: <span className="font-bold">{formatCurrency(result.salaryRangeMin, result.currency)} - {formatCurrency(result.salaryRangeMax, result.currency)}</span>
            </div>
            <div className="p-4 bg-black/20 rounded-lg text-left backdrop-blur-sm max-w-md mx-auto">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5"/> AI Justification</h3>
                <p className="text-sm text-primary-foreground/80">{result.justification}</p>
            </div>
        </div>
    </div>
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
      setError('Failed to generate salary estimation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <LandingHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pt-32">
        <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline">AI Salary Calculator</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Benchmark your worth. Enter your details to get a personalized salary estimate powered by AI.
            </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Form Column */}
            <div>
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Professional Profile</CardTitle>
                        <CardDescription>Provide your information to get a salary estimate from our AI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Role</FormLabel>
                                            <FormControl><Input placeholder="e.g., Senior Frontend Developer" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="experience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Years of Experience</FormLabel>
                                            <FormControl><Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="skills"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Key Skills</FormLabel>
                                            <FormControl><Input placeholder="e.g., React, Node.js, AWS, Python" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl><Input placeholder="e.g., Bengaluru, India" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="companySize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Size</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select company size" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="startup">Startup (1-50 employees)</SelectItem>
                                                    <SelectItem value="mid-size">Mid-size (51-1000 employees)</SelectItem>
                                                    <SelectItem value="large-enterprise">Large Enterprise (1000+ employees)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="pt-4">
                                     <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <TrendingUp className="mr-2 h-4 w-4"/>}
                                        {isLoading ? 'Analyzing...' : 'Calculate Salary'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            {/* Result Column */}
            <div className="min-h-[500px] lg:min-h-0">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center rounded-2xl bg-muted/30 border">
                        <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                        <h3 className="text-xl font-semibold">Calculating...</h3>
                        <p className="text-muted-foreground">Our AI is analyzing market data for you.</p>
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center text-center rounded-2xl bg-destructive/10 border border-destructive">
                        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                        <h3 className="text-xl font-semibold text-destructive-foreground">Calculation Failed</h3>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Button variant="destructive" onClick={() => setError(null)}>Try Again</Button>
                    </div>
                ) : result ? (
                    <>
                        <SalaryResult result={result} />
                        <Button variant="outline" className="w-full mt-6" onClick={() => { setResult(null); form.reset(); }}>
                            Calculate a Different Salary
                        </Button>
                    </>
                ) : (
                    <ResultPlaceholder />
                )}
            </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
