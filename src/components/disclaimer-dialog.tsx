'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { BarChart, BrainCircuit, Code, Copy, Sparkles, X } from 'lucide-react';
import Image from 'next/image';

const features = [
    { icon: BrainCircuit, title: 'AI Mock Interviews', description: 'Practice with a realistic AI that asks relevant questions and gives real-time feedback.' },
    { icon: Code, title: 'Coding Gym', description: 'Solve unlimited coding problems and get instant analysis from our AI assistant.' },
    { icon: Sparkles, title: 'Portfolio Builder', description: 'Create a professional portfolio that automatically showcases your skills and projects.' },
    { icon: BarChart, title: 'Detailed Analytics', description: 'Track your performance over time and identify areas for improvement.' },
];

export default function PromotionalPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const hasSeenPromo = sessionStorage.getItem('hasSeenPromo');
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Open after 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (andRedirect: boolean = false) => {
    sessionStorage.setItem('hasSeenPromo', 'true');
    setIsOpen(false);
    if (andRedirect) {
       router.push(user ? '/dashboard/pricing' : '/signup');
    }
  };
  
  const handleCopyAndRedirect = () => {
    navigator.clipboard.writeText('FIRST1000');
    toast({
        title: "Coupon Copied!",
        description: "Code FIRST1000 has been copied to your clipboard.",
    });
    handleDismiss(true);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
                <DialogHeader>
                <DialogTitle className="text-3xl font-bold font-headline mb-2">Welcome to Talxify!</DialogTitle>
                <DialogDescription>
                    Get a head start on your career with our exclusive launch offer.
                </DialogDescription>
                </DialogHeader>
                
                <div className="my-6 space-y-4">
                    {features.map(feature => (
                        <div key={feature.title} className="flex items-start gap-3">
                            <div className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5">
                                <feature.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{feature.title}</p>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-muted border-dashed border-2 border-primary/50 rounded-lg p-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Use coupon code to get a discount!</p>
                    <p className="text-2xl font-bold tracking-widest text-primary">FIRST1000</p>
                </div>
                
                <div className="mt-6">
                    <Button onClick={handleCopyAndRedirect} className="w-full" size="lg">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code & Claim Offer
                    </Button>
                </div>
            </div>
            <div className="hidden md:block relative">
                 <Image src="/popup.png" alt="Promotional Offer" layout="fill" objectFit="cover" data-ai-hint="abstract technology" />
                 <div className="absolute inset-0 bg-primary/70" />
            </div>
        </div>
        <button onClick={() => handleDismiss()} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
