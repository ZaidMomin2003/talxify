
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
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { BrainCircuit, Code, Copy, Swords, BookOpen, FileText, User, Gem } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


const features = [
    { icon: BrainCircuit, title: 'AI Mock Interviews', description: 'Practice with a realistic AI that asks relevant questions.' },
    { icon: Swords, title: '30-Day Prep Arena', description: 'Follow a personalized syllabus to master key concepts.' },
    { icon: Code, title: 'Code Izanami', description: 'Adaptive coding quizzes that challenge your skills.'},
    { icon: BookOpen, title: 'Detailed Notes Generation', description: 'Generate in-depth study notes on any technical topic.'},
    { icon: FileText, title: 'Resume Builder', description: 'Craft a professional resume with our easy-to-use tool.', badge: 'Free Forever' },
    { icon: User, title: 'Portfolio Builder', description: 'Showcase your skills with an automatically generated portfolio.' },
];

export default function PromotionalPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const hasSeenPromo = sessionStorage.getItem('hasSeenPromo');
    // Only show the promo on the landing page ('/')
    if (pathname === '/' && !hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Open after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [pathname]);

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
      <DialogContent className="max-w-xl w-[90vw] rounded-xl p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
            <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-2xl font-bold font-headline">Unlock Your Potential with Talxify</DialogTitle>
                <DialogDescription>
                    Get a head start on your career with our exclusive launch offer.
                </DialogDescription>
            </DialogHeader>
            
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {features.map(feature => (
                    <div key={feature.title} className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary rounded-lg p-2 mt-0.5">
                            <feature.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                                {feature.badge && <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-none px-1.5 py-0 text-[10px]"><Gem className="w-2.5 h-2.5 mr-1"/>{feature.badge}</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground hidden sm:block">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-muted border-dashed border-2 border-primary/50 rounded-lg p-3 text-center mb-6">
                <p className="text-xs text-muted-foreground">Exclusive Launch Offer Coupon:</p>
                <p className="text-xl font-bold tracking-widest text-primary">FIRST1000</p>
            </div>
            
            <Button onClick={handleCopyAndRedirect} className="w-full" size="lg">
                <Copy className="mr-2 h-4 w-4" />
                Copy Code & Claim Offer
            </Button>
        </div>
        <button onClick={() => handleDismiss(false)} className="w-full text-center py-3 text-sm text-muted-foreground hover:bg-muted transition-colors">
            Maybe later
        </button>
      </DialogContent>
    </Dialog>
  );
}
