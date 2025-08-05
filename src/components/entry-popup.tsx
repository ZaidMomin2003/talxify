
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, Check, X } from 'lucide-react';
import Link from 'next/link';

const features = [
  'AI Mock Interviews',
  'Unlimited Coding Questions',
  'Performance Analytics',
  'Portfolio Builder',
];

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
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/20 shadow-2xl">
        <div className="relative p-8 bg-cover text-center bg-[url('/popup.png')]" data-ai-hint="abstract technology">
            <div className="absolute inset-0 bg-primary/80"></div>
            <div className="relative z-10">
                <div className="flex justify-center mb-4">
                    <div className="bg-primary-foreground text-primary rounded-full p-3 shadow-lg">
                        <Rocket className="w-8 h-8" />
                    </div>
                </div>
                <DialogTitle className="text-3xl font-headline font-bold text-primary-foreground">Ready to Ace Your Interview?</DialogTitle>
                <DialogDescription className="text-primary-foreground/90 mt-2">
                    Unlock your potential with AI-powered tools designed to help you land your dream job.
                </DialogDescription>
            </div>
        </div>
        <div className="p-8 bg-background">
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="w-full" size="lg">
            <Link href="/signup">Get Started Now</Link>
          </Button>
           <Button variant="link" className="w-full mt-2 text-muted-foreground" onClick={() => setIsOpen(false)}>
                Maybe later
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
