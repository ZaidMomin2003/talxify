'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Rocket, BrainCircuit, MessageSquare, FileText, Bot, ShieldQuestion, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';

const featurePrototypes = [
    // Step 1: Generate Practice Material
    (
        <Card className="w-full h-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl border border-border/50 flex flex-col justify-center">
             <CardHeader className="p-0 mb-4 flex flex-row items-center gap-3">
                <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-lg"><BrainCircuit className="w-6 h-6"/></div>
                <CardTitle className="text-xl m-0">Generated Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
                <div className="p-3 rounded-lg bg-muted border">
                    <Badge variant="destructive" className="mb-2">Coding</Badge>
                    <p className="font-medium text-sm">Implement an algorithm to find the maximum contiguous subarray sum (Kadane's Algorithm).</p>
                </div>
                <div className="p-3 rounded-lg bg-muted border opacity-70">
                     <Badge variant="secondary" className="mb-2">Behavioral</Badge>
                    <p className="font-medium text-sm">Tell me about a time you had to take ownership of a failing project.</p>
                </div>
            </CardContent>
        </Card>
    ),
    // Step 2: Practice with AI
    (
        <Card className="w-full h-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl border border-border/50 flex flex-col justify-center">
            <CardHeader className="p-0 mb-4 flex-row items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-lg text-primary"><MessageSquare className="w-6 h-6" /></div>
                <CardTitle className="text-xl m-0">Live Interview Practice</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
                <div className="p-3 rounded-lg bg-muted border text-left">
                    <p className="text-sm font-semibold flex items-center gap-2"><Bot className="w-4 h-4 text-primary"/> AI Interviewer</p>
                    <p className="text-muted-foreground text-xs mt-1">"Thanks for sharing that. Can you elaborate on the technical challenges you faced?"</p>
                </div>
                 <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-right">
                    <p className="text-sm font-semibold flex items-center justify-end gap-2"><User className="w-4 h-4 text-foreground"/> You</p>
                    <p className="text-muted-foreground text-xs mt-1">"Certainly. The main challenge was integrating the legacy authentication system..."</p>
                </div>
            </CardContent>
        </Card>
    ),
    // Step 3: Build Your Profile
    (
        <Card className="w-full h-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl border border-border/50 flex flex-col justify-center">
            <CardHeader className="p-0 mb-4 flex-row items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileText className="w-6 h-6" /></div>
                <CardTitle className="text-xl m-0">Profile & Resume</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted border">
                    <Avatar className="w-12 h-12 border-2 border-primary">
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold">Jane Doe</p>
                        <p className="text-sm text-muted-foreground">Software Engineer</p>
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-muted border text-sm text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Skills:</span> React, Next.js, System Design...</p>
                </div>
            </CardContent>
        </Card>
    ),
    // Step 4: Land Your Job
    (
        <Card className="w-full h-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm p-6 shadow-xl border border-border/50 flex flex-col justify-center text-center">
            <div className="mx-auto w-fit p-4 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20">
                <Rocket className="w-10 h-10"/>
            </div>
            <h3 className="text-2xl font-bold text-foreground">Offer Received!</h3>
            <p className="text-muted-foreground mt-2">Your hard work paid off. Congratulations on the new role!</p>
        </Card>
    )
];


const features = [
  {
    step: 'Step 1',
    title: 'Generate Practice Material',
    content:
      "Create tailored interview questions, study notes, or coding quizzes based on the role and company you're targeting.",
    icon: <BrainCircuit className="text-primary h-6 w-6" />,
    prototype: featurePrototypes[0],
  },
  {
    step: 'Step 2',
    title: 'Practice with AI',
    content:
      'Use the generated material to practice. Engage in mock interviews, solve coding problems, and study key concepts.',
    icon: <MessageSquare className="text-primary h-6 w-6" />,
    prototype: featurePrototypes[1],
  },
  {
    step: 'Step 3',
    title: 'Build Your Profile',
    content:
      'Craft a professional resume and build a portfolio to showcase your skills and preparation progress to recruiters.',
    icon: <FileText className="text-primary h-6 w-6" />,
    prototype: featurePrototypes[2],
  },
  {
    step: 'Step 4',
    title: 'Land Your Dream Job',
    content:
      'Apply for jobs with confidence, backed by rigorous, AI-powered preparation and a standout professional profile.',
    icon: <Rocket className="text-primary h-6 w-6" />,
    prototype: featurePrototypes[3],
  },
];

export default function LandingFeatureSteps() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

   useEffect(() => {
    const timer = setInterval(() => {
        setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000); // Change feature every 4 seconds

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      setProgress(0);
      const progressTimer = setInterval(() => {
          setProgress(p => p + (100 / (4000 / 50)))
      }, 50);

      return () => clearInterval(progressTimer);
  }, [currentFeature])

  return (
    <div className={'p-8 md:p-12'}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative mx-auto mb-12 max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
              Your Path to Success in 4 Steps
            </h2>
            <p className="text-foreground/60 mt-3">
              Talxify helps you create, practice, and deploy your skills faster than ever before.
            </p>
          </div>
        </div>
        <hr className="bg-foreground/30 mx-auto mb-10 h-px w-1/2" />

         <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          <div className="order-2 space-y-8 md:order-1">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-6 md:gap-8"
                initial={{ opacity: 0.3, x: -20 }}
                animate={{
                  opacity: index === currentFeature ? 1 : 0.3,
                  x: 0,
                  scale: index === currentFeature ? 1.05 : 1,
                }}
                transition={{ duration: 0.5 }}
                onTap={() => {
                  setCurrentFeature(index);
                  setProgress(0);
                }}
                style={{ cursor: 'pointer' }}
              >
                <motion.div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 md:h-14 md:w-14 shrink-0',
                    index === currentFeature
                      ? 'border-primary bg-primary/10 text-primary scale-110 [box-shadow:0_0_15px_rgba(192,15,102,0.3)]'
                      : 'border-muted-foreground bg-muted',
                  )}
                >
                  {feature.icon}
                </motion.div>

                 <div className="flex-1">
                  <h3 className="text-xl font-semibold md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

           <div
            className={cn(
              'border-primary/20 relative order-1 h-[300px] overflow-hidden rounded-xl border [box-shadow:0_5px_30px_-15px_rgba(192,15,102,0.3)] md:order-2 md:h-auto',
            )}
          >
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 overflow-hidden rounded-lg p-4 flex items-center justify-center"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      {feature.prototype}
                      <div className="from-background via-background/50 absolute right-0 bottom-0 left-0 h-1/3 bg-gradient-to-t to-transparent" />

                       <div className="bg-background/80 absolute bottom-4 left-4 rounded-lg p-2 backdrop-blur-sm border">
                        <span className="text-primary text-xs font-medium">
                          {feature.step}
                        </span>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent border-t border-border">
                <motion.div 
                    className="h-full bg-primary"
                    style={{ width: `${progress}%` }}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
