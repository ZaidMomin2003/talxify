
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { updateUserOnboardingData } from '@/lib/firebase-service';
import { generateSyllabus, GenerateSyllabusInput } from '@/ai/flows/generate-syllabus';
import type { OnboardingData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const roles = ['Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Mobile Developer'];
const companies = ['Google', 'Meta', 'Amazon', 'Netflix', 'Apple', 'Microsoft'];

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

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    name: user?.displayName || '',
    university: '',
    major: '',
    roles: [],
    companies: [],
  });
  const [customRole, setCustomRole] = useState('');
  const [customCompany, setCustomCompany] = useState('');


  useEffect(() => {
    if (user && user.displayName && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.displayName! }));
    }
  }, [user, formData.name]);

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };
  
  const handleArrayToggle = (field: 'roles' | 'companies', value: string) => {
    setFormData(prev => {
        const currentValues = prev[field];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        return {...prev, [field]: newValues};
    });
  }

  const handleAddCustomRole = () => {
    if (customRole.trim() && !formData.roles.includes(customRole.trim())) {
        setFormData(prev => ({ ...prev, roles: [...prev.roles, customRole.trim()] }));
        setCustomRole('');
    }
  };

  const handleAddCustomCompany = () => {
    if (customCompany.trim() && !formData.companies.includes(customCompany.trim())) {
        setFormData(prev => ({ ...prev, companies: [...prev.companies, customCompany.trim()] }));
        setCustomCompany('');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    
    if (formData.roles.length === 0 || formData.companies.length === 0) {
        toast({ title: "Information Missing", description: "Please select at least one role and one company.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    setStep(prev => prev + 1); // Move to loading screen

    try {
        const syllabusInput: GenerateSyllabusInput = {
            roles: formData.roles.join(', '),
            companies: formData.companies.join(', '),
        };
        const syllabusResult = await generateSyllabus(syllabusInput);
        
        await updateUserOnboardingData(user.uid, formData, syllabusResult.syllabus);
        
        toast({ title: "Onboarding Complete!", description: "Your personalized learning plan is ready." });
        router.push('/dashboard/arena');

    } catch (error) {
        console.error("Onboarding failed:", error);
        toast({ title: "Onboarding Failed", description: "Could not generate your syllabus. Please try again.", variant: "destructive" });
        setIsProcessing(false);
        setStep(prev => prev -1); // Go back to the form
    }
  };

  const steps = [
    // Step 0: Welcome
    <motion.div key={0} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full">
        <h1 className="text-4xl font-bold font-headline mb-4">Welcome to Talxify, {formData.name}!</h1>
        <p className="text-lg text-muted-foreground mb-8">Let's personalize your experience. This will only take a minute.</p>
        <Button onClick={handleNext} size="lg">Let's Get Started <ArrowRight className="ml-2"/></Button>
    </motion.div>,

    // Step 1: Education
    <motion.div key={1} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">Tell us about your education.</h2>
        <div className="space-y-2">
            <label htmlFor="university" className="text-lg">University/College Name</label>
            <Input id="university" placeholder="e.g., State University" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="h-12 text-lg"/>
        </div>
        <div className="space-y-2">
            <label htmlFor="major" className="text-lg">Major/Field of Study</label>
            <Input id="major" placeholder="e.g., Computer Science" value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="h-12 text-lg"/>
        </div>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={!formData.university || !formData.major}>Next</Button>
        </div>
    </motion.div>,

    // Step 2: Roles
    <motion.div key={2} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">What roles are you interested in?</h2>
        <p className="text-muted-foreground">Select all that apply.</p>
        <div className="flex flex-wrap gap-3">
            {roles.map(role => (
                 <Badge 
                    key={role}
                    onClick={() => handleArrayToggle('roles', role)}
                    className={cn(
                        "text-base px-4 py-2 cursor-pointer transition-all", 
                        formData.roles.includes(role) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                >{role}</Badge>
            ))}
        </div>
         <div className="flex gap-2 pt-4">
            <Input 
                placeholder="Or add your own role" 
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomRole(); } }}
            />
            <Button onClick={handleAddCustomRole} type="button">Add</Button>
        </div>
        <div className="flex gap-4">
             <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
             <Button onClick={handleNext} size="lg" disabled={formData.roles.length === 0}>Next</Button>
        </div>
    </motion.div>,

    // Step 3: Companies
    <motion.div key={3} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full space-y-6">
        <h2 className="text-3xl font-bold font-headline">Any dream companies?</h2>
        <p className="text-muted-foreground">Select your target companies.</p>
        <div className="flex flex-wrap gap-3">
            {companies.map(company => (
                 <Badge 
                    key={company}
                    onClick={() => handleArrayToggle('companies', company)}
                    className={cn(
                        "text-base px-4 py-2 cursor-pointer transition-all", 
                        formData.companies.includes(company) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                >{company}</Badge>
            ))}
        </div>
        <div className="flex gap-2 pt-4">
            <Input 
                placeholder="Or add a company" 
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCompany(); } }}
            />
            <Button onClick={handleAddCustomCompany} type="button">Add</Button>
        </div>
        <div className="flex gap-4">
            <Button onClick={handleBack} variant="outline" size="lg">Back</Button>
            <Button onClick={handleSubmit} size="lg" disabled={formData.companies.length === 0}>Finish Onboarding</Button>
        </div>
    </motion.div>,

    // Step 4: Processing
    <motion.div key={4} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold font-headline">Crafting Your Plan...</h2>
        <p className="text-muted-foreground mt-2">Our AI is generating a personalized 60-day syllabus just for you.</p>
    </motion.div>
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 h-2 w-full rounded-full bg-muted">
          <motion.div
            className="h-2 rounded-full bg-primary"
            animate={{ width: `${((step) / (steps.length - 2)) * 100}%` }}
            transition={{ ease: 'easeInOut', duration: 0.5 }}
          />
        </div>
        <div className="relative flex h-96 items-center justify-center overflow-hidden">
             <AnimatePresence initial={false} custom={direction}>
                {steps[step]}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

    