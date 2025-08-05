
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, Check, BrainCircuit, Bot, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  { 
    icon: <Bot className="w-5 h-5 text-primary" />,
    title: 'Hyper-Realistic AI Interviewer',
    description: 'Face an AI that adapts to your responses and challenges you like a real hiring manager.' 
  },
  { 
    icon: <BrainCircuit className="w-5 h-5 text-primary" />,
    title: 'Instant, Actionable Feedback', 
    description: 'Receive a detailed breakdown of your performance, from technical accuracy to delivery.' 
  },
  { 
    icon: <Lightbulb className="w-5 h-5 text-primary" />,
    title: 'Master Any Concept',
    description: 'Generate unlimited questions on any topic to turn weaknesses into strengths.'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function EntryPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show the popup on every visit as requested.
    const timer = setTimeout(() => {
        setIsOpen(true);
    }, 1500); // Delay popup by 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-primary/20 shadow-2xl">
        <div className="relative p-8 text-center bg-[url('/popup.png')] bg-cover bg-center bg-no-repeat" data-ai-hint="abstract technology">
            <div className="absolute inset-0 bg-primary/80"></div>
            <motion.div 
              className="relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-primary-foreground text-primary rounded-full p-3 shadow-lg">
                        <Rocket className="w-8 h-8" />
                    </div>
                </div>
                <DialogTitle className="text-3xl font-headline font-bold text-primary-foreground">Don't Just Practice. Dominate.</DialogTitle>
                <DialogDescription className="text-primary-foreground/90 mt-2 max-w-sm mx-auto">
                    Our AI doesn't just ask questions—it analyzes, adapts, and trains you to win.
                </DialogDescription>
            </motion.div>
        </div>
        <motion.div 
          className="p-8 bg-background"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <motion.li key={index} className="flex items-start gap-4" variants={itemVariants}>
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>
           <motion.div variants={itemVariants}>
            <Button asChild className="w-full" size="lg">
                <Link href="/signup">Start Your Transformation</Link>
            </Button>
           </motion.div>
           <motion.div variants={itemVariants}>
            <Button variant="link" className="w-full mt-2 text-muted-foreground" onClick={() => setIsOpen(false)}>
                    I'm not ready to win yet
            </Button>
           </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
