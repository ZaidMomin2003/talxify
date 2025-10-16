
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
import { DollarSign, Loader2, Sparkles, BrainCircuit, AlertTriangle } from 'lucide-react';

function SalaryResult({ result }: { result: GenerateSalaryEstimationOutput }) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="shadow-lg border-primary/20">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
                <DollarSign className="h-10 w-10" />
            </div>
            <CardTitle className="text-4xl font-bold font-headline">Estimated Annual Salary</CardTitle>
            <CardDescription>Based on the information you provided.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
            <div>
                <p className="text-6xl font-bold text-primary">{formatCurrency(result.estimatedSalary, result.currency)}</p>
                <p className="text-muted-foreground font-semibold">{result.currency} / year</p>
            </div>
             <div className="text-lg text-muted-foreground">
                Likely Range: <span className="font-semibold text-foreground">{formatCurrency(result.salaryRangeMin, result.currency)} - {formatCurrency(result.salaryRangeMax, result.currency)}</span>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-left">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> AI Justification</h3>
                <p className="text-sm text-muted-foreground">{result.justification}</p>
            </div>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">Disclaimer: This is an AI-generated estimate and should be used for informational purposes only. Actual salaries may vary.</p>
        </CardFooter>
    </Card>
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
      <main className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 pt-24">
        <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline">AI Salary Calculator</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Estimate your market value based on your profile.
            </p>
        </div>
        
        {!result && !isLoading && !error && (
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Enter Your Details</CardTitle>
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
                                        <FormControl><Input placeholder="e.g., San Francisco, USA or Bengaluru, India" {...field} /></FormControl>
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
                             <Button type="submit" size="lg" className="w-full">
                                Calculate Salary <DollarSign className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        )}

        {isLoading && (
            <Card className="shadow-lg text-center p-8">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold">Calculating...</h3>
                <p className="text-muted-foreground">Our AI is analyzing the market data for you.</p>
            </Card>
        )}
        
        {error && (
             <Card className="shadow-lg text-center p-8 border-destructive">
                <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <h3 className="text-xl font-semibold text-destructive">Calculation Failed</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => setError(null)}>Try Again</Button>
            </Card>
        )}

        {result && (
            <div>
                <SalaryResult result={result} />
                <Button variant="outline" className="w-full mt-6" onClick={() => { setResult(null); form.reset(); }}>
                    Calculate a Different Salary
                </Button>
            </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
