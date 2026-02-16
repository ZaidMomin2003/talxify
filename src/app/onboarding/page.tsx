
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
import type { OnboardingData } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const roles = ['Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Mobile Developer', 'Product Manager', 'UX/UI Designer'];
const companies = ['Google', 'Meta', 'Amazon', 'Netflix', 'Apple', 'Microsoft', 'OpenAI', 'NVIDIA'];
const majors = ['Computer Science', 'Data Science', 'Software Engineering', 'Information Technology', 'BCA/MCA', 'Artificial Intelligence', 'Cybersecurity', 'Electrical Engineering', 'Mechanical Engineering', 'Business/MBA'];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    filter: 'blur(10px)',
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    filter: 'blur(10px)',
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
    name: '',
    university: '',
    major: '',
    roles: [],
    companies: [],
  });
  const [customRole, setCustomRole] = useState('');
  const [customCompany, setCustomCompany] = useState('');

  const storageKey = 'onboardingFormData';

  useEffect(() => {
    const savedData = sessionStorage.getItem(storageKey);
    if (savedData) {
      setFormData(JSON.parse(savedData));
    } else if (user?.displayName) {
      setFormData(prev => ({ ...prev, name: user.displayName! }));
    }
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData]);


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
      return { ...prev, [field]: newValues };
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

    if (!formData.university || !formData.major) {
      toast({ title: "Information Missing", description: "Please provide your education details.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setStep(prev => prev + 1);

    try {
      await updateUserOnboardingData(user.uid, formData);
      sessionStorage.removeItem(storageKey);
      toast({ title: "Onboarding Complete!", description: "Welcome aboard Talxify!" });
      router.push('/dashboard');
    } catch (error) {
      console.error("Onboarding failed:", error);
      toast({ title: "Onboarding Failed", description: "Could not save your information. Please try again.", variant: "destructive" });
      setIsProcessing(false);
      setStep(prev => prev - 1);
    }
  };

  const steps = [
    // Step 0: Welcome
    <motion.div key={0} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full text-center space-y-8">
      <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-blue-600 flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(var(--primary),0.3)]">
        <Check className="h-12 w-12 text-black stroke-[3px]" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
          Welcome to <span className="text-primary italic">Talxify</span>, {formData.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground font-medium text-lg max-w-sm mx-auto leading-relaxed">
          Let's synchronize your profile for the ultimate interview experience.
        </p>
      </div>
      <Button onClick={handleNext} size="lg" className="rounded-2xl h-16 px-10 font-black uppercase italic tracking-tighter text-lg hover:scale-105 transition-all shadow-xl group">
        Illuminate Profile <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>,

    // Step 1: Education
    <motion.div key={1} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">Academic <span className="text-primary opacity-50">Foundation</span></h2>
        <p className="text-muted-foreground font-medium text-sm">Where did your journey begin?</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="university" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic pl-1">Institution Name</label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-2xl blur opacity-20 group-focus-within:opacity-100 transition duration-500" />
            <Input
              id="university"
              placeholder="e.g., Stanford University"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="h-14 text-lg bg-background/50 border-border rounded-2xl relative z-10 font-bold placeholder:font-medium placeholder:italic"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="major" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic pl-1">Field of Study</label>
          <div className="relative group mb-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-2xl blur opacity-20 group-focus-within:opacity-100 transition duration-500" />
            <Input
              id="major"
              placeholder="e.g., Computer Science"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              className="h-14 text-lg bg-background/50 border-border rounded-2xl relative z-10 font-bold placeholder:font-medium placeholder:italic"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {majors.map((m) => (
              <button
                key={m}
                onClick={() => setFormData({ ...formData, major: m })}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight italic transition-all border",
                  formData.major === m
                    ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:bg-muted"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={handleBack} variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-tighter border-border bg-muted/30">Back</Button>
        <Button onClick={handleNext} className="rounded-2xl h-14 px-10 font-black uppercase italic tracking-tighter flex-1 shadow-lg" disabled={!formData.university || !formData.major}>Continue <ChevronRight className="ml-2 h-5 w-5" /></Button>
      </div>
    </motion.div>,

    // Step 2: Roles
    <motion.div key={2} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">Target <span className="text-primary">Objectives</span></h2>
        <p className="text-muted-foreground font-medium text-sm">Select the roles that match your ambition.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => handleArrayToggle('roles', role)}
            className={cn(
              "px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-tight italic transition-all border",
              formData.roles.includes(role)
                ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50"
            )}
          >{role}</button>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex gap-2 relative group">
          <Input
            placeholder="Identify custom role..."
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomRole(); } }}
            className="h-14 bg-background/50 border-border rounded-2xl font-bold placeholder:italic"
          />
          <Button onClick={handleAddCustomRole} type="button" variant="secondary" className="h-14 rounded-2xl px-6 font-bold uppercase italic border-border border">Add</Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleBack} variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-tighter bg-muted/30">Back</Button>
        <Button onClick={handleNext} className="rounded-2xl h-14 px-10 font-black uppercase italic tracking-tighter flex-1 shadow-lg">Next Objective <ChevronRight className="ml-2 h-5 w-5" /></Button>
      </div>
    </motion.div>,

    // Step 3: Companies
    <motion.div key={3} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">Dream <span className="text-primary">Ecosystems</span></h2>
        <p className="text-muted-foreground font-medium text-sm">Where do you want to deploy your skills?</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {companies.map(company => (
          <button
            key={company}
            onClick={() => handleArrayToggle('companies', company)}
            className={cn(
              "px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-tight italic transition-all border",
              formData.companies.includes(company)
                ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50"
            )}
          >{company}</button>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex gap-2 relative group">
          <Input
            placeholder="Enter target organization..."
            value={customCompany}
            onChange={(e) => setCustomCompany(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCompany(); } }}
            className="h-14 bg-background/50 border-border rounded-2xl font-bold placeholder:italic"
          />
          <Button onClick={handleAddCustomCompany} type="button" variant="secondary" className="h-14 rounded-2xl px-6 font-bold uppercase italic border-border border">Add</Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleBack} variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-tighter bg-muted/30">Back</Button>
        <Button onClick={handleSubmit} className="rounded-2xl h-14 px-10 font-black uppercase italic tracking-tighter flex-1 shadow-2xl bg-primary text-black hover:scale-[1.02] transition-all" disabled={isProcessing}>
          {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : 'Finalize Profile'}
        </Button>
      </div>
    </motion.div>,

    // Step 4: Processing
    <motion.div key={4} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween' }} className="w-full text-center space-y-10 py-10">
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[ping_2s_infinite]" />
        <Loader2 className="h-24 w-24 animate-spin text-primary relative z-10" />
      </div>
      <div className="space-y-3">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Initiating <span className="text-primary italic">Dashboard</span></h2>
        <p className="text-muted-foreground font-medium tracking-widest text-[10px] uppercase italic animate-pulse">Synchronizing Neural Networks...</p>
      </div>
    </motion.div>
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background transition-colors duration-500 p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <Card className="rounded-[3rem] border-border bg-card/60 dark:bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden border p-8 md:p-12">
          {/* Progress Bar */}
          <div className="mb-12 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Initialization Matrix</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">{step + 1} / {steps.length - 1}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${((step) / (steps.length - 2)) * 100}%` }}
                transition={{ ease: 'easeInOut', duration: 0.8 }}
              />
            </div>
          </div>

          <div className="relative flex min-h-[400px] items-center justify-center overflow-x-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {steps[step]}
            </AnimatePresence>
          </div>
        </Card>

        {/* Footer Support Text */}
        <p className="text-center mt-8 text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest italic">Talxify Neural Core v2.0 // Secured Connection</p>
      </div>
    </div>
  );
}
