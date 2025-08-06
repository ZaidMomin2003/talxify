
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

const features = [
  { 
    name: 'AI Mock Interviews',
  },
  { 
    name: 'Unlimited Coding Questions', 
  },
  { 
    name: 'Portfolio Builder',
  },
  {
    name: 'Detailed Analytics',
  }
];

export default function EntryPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenEntryPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenEntryPopup', 'true');
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl w-[95%] p-0 overflow-hidden border-border/20 shadow-2xl rounded-2xl bg-background grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left Side - Image */}
        <div className="relative h-64 md:h-full w-full">
            <Image 
                src="/popup.png" 
                alt="Talxify AI Assistant" 
                layout="fill"
                objectFit="cover"
                className="rounded-t-2xl md:rounded-l-2xl md:rounded-r-none"
                data-ai-hint="abstract technology"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Right Side - Content */}
        <motion.div 
            className="p-8 flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="text-center md:text-left mb-6">
                <h2 className="text-3xl font-headline font-bold text-foreground">Upgrade to Pro</h2>
                <p className="text-muted-foreground mt-2">
                    Unlock all features and get the tools you need to land your dream job.
                </p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature.name} className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-foreground font-medium">{feature.name}</span>
                </li>
              ))}
            </ul>
            
            <Button asChild className="w-full" size="lg">
                <Link href="/signup">Sign Up and Get Started</Link>
            </Button>
            
            <Button variant="ghost" className="w-full mt-2 text-muted-foreground text-xs h-auto py-1" onClick={() => setIsOpen(false)}>
                Maybe later
            </Button>
        </motion.div>
        
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors bg-background/50 rounded-full p-1">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
