
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, Code, LayoutDashboard, BarChart, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  { 
    icon: <Bot className="w-6 h-6 text-primary" />,
    title: 'AI Mock Interviews',
    description: 'Practice with a realistic AI that gives real-time feedback.' 
  },
  { 
    icon: <Code className="w-6 h-6 text-primary" />,
    title: 'Unlimited Coding Questions', 
    description: 'Generate questions for any topic and skill level.' 
  },
  { 
    icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
    title: 'Portfolio Builder',
    description: 'Showcase your skills with a professional portfolio.'
  },
  {
    icon: <BarChart className="w-6 h-6 text-primary" />,
    title: 'Detailed Analytics',
    description: 'Track your progress and identify areas for improvement.'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
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
    // Show popup on every visit after a delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg w-[95%] p-0 overflow-hidden border-border/20 shadow-2xl rounded-2xl bg-background">
        <motion.div 
            className="p-8"
            variants={containerVariants}
            initial="hidden"
            animate={isOpen ? 'visible' : 'hidden'}
        >
            <motion.div variants={itemVariants} className="text-center mb-6">
                <h2 className="text-3xl font-headline font-bold text-foreground">Unlock Your Full Potential</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    Everything you need to land your dream job, all included in our <span className="text-primary font-semibold">Pro Plan</span>.
                </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                    <motion.div 
                        key={index}
                        variants={itemVariants}
                        className="p-4 rounded-lg bg-card border border-border/50 flex items-start gap-4"
                    >
                        <div className="bg-primary/10 rounded-full p-2 mt-1">
                            {feature.icon}
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground text-base">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <motion.div variants={itemVariants}>
                <Button asChild className="w-full group" size="lg">
                    <Link href="/signup">
                        Get Started Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </Button>
            </motion.div>
             <motion.div variants={itemVariants}>
                <Button variant="ghost" className="w-full mt-2 text-muted-foreground text-xs h-auto py-1" onClick={() => setIsOpen(false)}>
                    Explore the site first
                </Button>
           </motion.div>
        </motion.div>
         <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
