
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

interface SurveyData {
    challenge: string;
    aiValue: string;
    practiceMethod: string[];
    helpfulTools: string[];
    pricePoint: string;
    languages: string;
    feedbackImportance: string;
    experienceLevel: string;
    likelihood: string;
    otherFeedback: string;
    name: string;
    email: string;
}

const toolOptions = [
    { id: 'code-review', label: 'An AI that reviews your code for correctness and style.' },
    { id: 'study-guides', label: 'An AI that generates personalized study guides on any topic.' },
    { id: 'resume-builder', label: 'An AI that helps you build a professional resume.' },
    { id: 'portfolio-website', label: 'An AI that creates a portfolio website for you.' },
]

export default function SurveyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<SurveyData>>({});

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleValueChange = (field: keyof SurveyData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleMultiChoiceToggle = (field: keyof SurveyData, value: string) => {
    setFormData(prev => {
        const currentValues = (prev[field] as string[] | undefined) || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        return {...prev, [field]: newValues};
    });
  }

  const handleCheckboxToggle = (field: keyof SurveyData, value: string) => {
    setFormData(prev => {
        const currentValues = (prev[field] as string[] | undefined) || [];
        let newValues;
        if (currentValues.includes(value)) {
            newValues = currentValues.filter(v => v !== value);
        } else {
            if (currentValues.length < 2) {
                newValues = [...currentValues, value];
            } else {
                toast({title: "You can only select up to 2 options.", variant: "destructive"});
                newValues = currentValues;
            }
        }
        return {...prev, [field]: newValues};
    });
  }

  const handleSubmit = async () => {
    setIsProcessing(true);
    setStep(prev => prev + 1); // Move to loading screen
    
    console.log("Final Survey Data:", formData);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setStep(prev => prev + 1); // Move to thank you screen
  };

  const steps = [
    // Step 0: Welcome
    <motion.div key={0} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full">
        <h1 className="text-4xl font-bold font-headline mb-4">Your Feedback Matters</h1>
        <p className="text-lg text-muted-foreground mb-8">Help us shape the future of interview prep. This will only take a couple of minutes.</p>
        <Button onClick={handleNext} size="lg">Start Survey <ArrowRight className="ml-2"/></Button>
    </motion.div>,

    // Question 1
    <motion.div key={1} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">When preparing for a technical interview, what is your single biggest challenge?</h2>
        <Textarea 
            placeholder="e.g., Finding relevant practice problems, not knowing what to expect, getting nervous..." 
            className="min-h-[120px] text-lg" 
            value={formData.challenge || ''}
            onChange={(e) => handleValueChange('challenge', e.target.value)}
        />
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.challenge}>Next</Button>
        </div>
    </motion.div>,

    // Question 2
    <motion.div key={2} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">How valuable would it be to practice interviews with a conversational AI?</h2>
        <p className="text-muted-foreground">Scale: 1 (Not Valuable) to 10 (Extremely Valuable)</p>
        <RadioGroup value={formData.aiValue} onValueChange={(v) => handleValueChange('aiValue', v)} className="flex flex-wrap gap-2 justify-center pt-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                <RadioGroupItem key={value} value={String(value)} id={`val-${value}`} className="sr-only"/>
            ))}
             {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                <Label key={value} htmlFor={`val-${value}`} className={cn("flex items-center justify-center h-12 w-12 text-lg rounded-full border cursor-pointer transition-all",
                    formData.aiValue === String(value) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                )}>{value}</Label>
            ))}
        </RadioGroup>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.aiValue}>Next</Button>
        </div>
    </motion.div>,

     // Question 3
    <motion.div key={3} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">How would you prefer to practice interviews with an AI?</h2>
        <p className="text-muted-foreground">Select all that apply.</p>
        <div className="space-y-3 pt-2">
            {['Text Chat', 'Voice Chat', 'Video Call'].map(method => (
                 <Card key={method} onClick={() => handleMultiChoiceToggle('practiceMethod', method)} className={cn("cursor-pointer transition-all", formData.practiceMethod?.includes(method) && "border-primary ring-2 ring-primary")}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <Checkbox checked={formData.practiceMethod?.includes(method)} />
                        <span className="text-lg font-medium">{method}</span>
                    </CardContent>
                 </Card>
            ))}
        </div>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.practiceMethod || formData.practiceMethod.length === 0}>Next</Button>
        </div>
    </motion.div>,
    
    // Question 4
    <motion.div key={4} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">Which of these AI tools would help you most?</h2>
        <p className="text-muted-foreground">Please choose your top two.</p>
        <div className="space-y-3 pt-2">
            {toolOptions.map(tool => (
                 <Card key={tool.id} onClick={() => handleCheckboxToggle('helpfulTools', tool.id)} className={cn("cursor-pointer transition-all", formData.helpfulTools?.includes(tool.id) && "border-primary ring-2 ring-primary")}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <Checkbox checked={formData.helpfulTools?.includes(tool.id)} disabled={!formData.helpfulTools?.includes(tool.id) && formData.helpfulTools?.length === 2}/>
                        <span className="text-base font-medium">{tool.label}</span>
                    </CardContent>
                 </Card>
            ))}
        </div>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.helpfulTools || formData.helpfulTools.length === 0}>Next</Button>
        </div>
    </motion.div>,

     // Question 5
    <motion.div key={5} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">How much would you pay for a comprehensive AI prep platform per month?</h2>
        <RadioGroup value={formData.pricePoint} onValueChange={(v) => handleValueChange('pricePoint', v)} className="space-y-3 pt-2">
            {['Free', '₹100 - ₹500', '₹500 - ₹1500', 'More than ₹1500'].map(price => (
                <Card key={price} className={cn("cursor-pointer transition-all", formData.pricePoint === price && "border-primary ring-2 ring-primary")}>
                    <Label htmlFor={price} className="p-4 flex items-center gap-4 cursor-pointer">
                        <RadioGroupItem value={price} id={price}/>
                        <span className="text-lg font-medium">{price}</span>
                    </Label>
                 </Card>
            ))}
        </RadioGroup>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.pricePoint}>Next</Button>
        </div>
    </motion.div>,

    // Question 6
     <motion.div key={6} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">What programming languages would you most want to see supported?</h2>
        <Input 
            placeholder="e.g., Python, Java, C++..." 
            className="h-12 text-lg"
            value={formData.languages || ''}
            onChange={(e) => handleValueChange('languages', e.target.value)}
        />
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.languages}>Next</Button>
        </div>
    </motion.div>,

    // Question 7
    <motion.div key={7} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">How important is detailed feedback on your performance?</h2>
        <p className="text-muted-foreground">Scale: 1 (Not Important) to 10 (Very Important)</p>
        <RadioGroup value={formData.feedbackImportance} onValueChange={(v) => handleValueChange('feedbackImportance', v)} className="flex flex-wrap gap-2 justify-center pt-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                <RadioGroupItem key={value} value={String(value)} id={`f-val-${value}`} className="sr-only"/>
            ))}
             {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                <Label key={value} htmlFor={`f-val-${value}`} className={cn("flex items-center justify-center h-12 w-12 text-lg rounded-full border cursor-pointer transition-all",
                    formData.feedbackImportance === String(value) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                )}>{value}</Label>
            ))}
        </RadioGroup>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.feedbackImportance}>Next</Button>
        </div>
    </motion.div>,

    // Question 8
     <motion.div key={8} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">What is your current experience level?</h2>
        <RadioGroup value={formData.experienceLevel} onValueChange={(v) => handleValueChange('experienceLevel', v)} className="space-y-3 pt-2">
            {['Student', 'Entry-Level (0-2 years)', 'Mid-Level (2-5 years)', 'Senior (5+ years)'].map(level => (
                <Card key={level} className={cn("cursor-pointer transition-all", formData.experienceLevel === level && "border-primary ring-2 ring-primary")}>
                    <Label htmlFor={level} className="p-4 flex items-center gap-4 cursor-pointer">
                        <RadioGroupItem value={level} id={level}/>
                        <span className="text-lg font-medium">{level}</span>
                    </Label>
                 </Card>
            ))}
        </RadioGroup>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.experienceLevel}>Next</Button>
        </div>
    </motion.div>,

    // Question 9
     <motion.div key={9} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">How likely would you be to use a tool like this for your next interview prep?</h2>
        <p className="text-muted-foreground">Scale: 1 (Very Unlikely) to 10 (Very Likely)</p>
        <RadioGroup value={formData.likelihood} onValueChange={(v) => handleValueChange('likelihood', v)} className="flex flex-wrap gap-2 justify-center pt-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                <RadioGroupItem key={value} value={String(value)} id={`l-val-${value}`} className="sr-only"/>
            ))}
             {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                <Label key={value} htmlFor={`l-val-${value}`} className={cn("flex items-center justify-center h-12 w-12 text-lg rounded-full border cursor-pointer transition-all",
                    formData.likelihood === String(value) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                )}>{value}</Label>
            ))}
        </RadioGroup>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.likelihood}>Next</Button>
        </div>
    </motion.div>,

    // Question 10
    <motion.div key={10} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">Is there anything else you wish existed in an interview prep tool?</h2>
        <Textarea 
            placeholder="Your ideas and suggestions are welcome!" 
            className="min-h-[120px] text-lg"
            value={formData.otherFeedback || ''}
            onChange={(e) => handleValueChange('otherFeedback', e.target.value)}
        />
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg">Next</Button>
        </div>
    </motion.div>,
    
    // Step 11: Final Info
    <motion.div key={11} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">Just one last step!</h2>
        <p className="text-muted-foreground">Enter your name and email to finish the survey.</p>
        <div className="space-y-2">
            <Label htmlFor="name" className="text-lg">Full Name</Label>
            <Input id="name" placeholder="e.g., Jane Doe" value={formData.name || ''} onChange={(e) => handleValueChange('name', e.target.value)} className="h-12 text-lg"/>
        </div>
        <div className="space-y-2">
            <Label htmlFor="email" className="text-lg">Email Address</Label>
            <Input id="email" type="email" placeholder="e.g., jane@example.com" value={formData.email || ''} onChange={(e) => handleValueChange('email', e.target.value)} className="h-12 text-lg"/>
        </div>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleSubmit} size="lg" disabled={!formData.name || !formData.email}>Submit Feedback</Button>
        </div>
    </motion.div>,


    // Step 12: Processing
    <motion.div key={12} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold font-headline">Submitting Your Feedback...</h2>
        <p className="text-muted-foreground mt-2">Thank you for helping us build a better platform.</p>
    </motion.div>,

    // Step 13: Thank You
    <motion.div key={13} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-12 w-12" />
        </div>
        <h2 className="text-4xl font-bold font-headline">Thank You!</h2>
        <p className="text-lg text-muted-foreground">Your feedback has been received. We appreciate you taking the time to help us improve.</p>
        <Button onClick={() => router.push('/')} size="lg">Back to Homepage</Button>
    </motion.div>
  ];

  const totalSteps = steps.length - 3; // Exclude welcome, processing and thank you screens from progress

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
            <AnimatePresence>
            {step > 0 && step <= totalSteps + 1 && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                 >
                    <p className="text-center text-muted-foreground mb-2">Question {step} of {totalSteps}</p>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <motion.div
                            className="h-2 rounded-full bg-primary"
                            animate={{ width: `${((step -1) / totalSteps) * 100}%` }}
                            transition={{ ease: 'easeInOut', duration: 0.5 }}
                        />
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
        <div className="relative flex min-h-[28rem] items-center justify-center overflow-hidden">
             <AnimatePresence initial={false} custom={direction}>
                {steps[step]}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
