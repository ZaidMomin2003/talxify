'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MinusIcon, PlusIcon, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'technical' | 'support';
}

const faqItems: FaqItem[] = [
  {
    id: '1',
    question: 'What is Talxify?',
    answer:
      'Talxify is an AI-powered platform designed to help you ace your tech interviews. We offer realistic mock interviews, a live coding gym, and detailed performance analytics to help you prepare effectively.',
    category: 'general',
  },
  {
    id: '2',
    question: 'How does the AI mock interview work?',
    answer:
      'Our AI simulates a real interview experience by asking you relevant technical and behavioral questions. It then provides instant feedback on your answers, clarity, and communication skills.',
    category: 'technical',
  },
  {
    id: '3',
    question: 'What kind of questions are in the coding gym?',
    answer:
      "You can generate unlimited coding questions on various topics (like algorithms, data structures) and difficulty levels. Our AI will analyze your solutions and provide feedback and correct examples.",
    category: 'technical',
  },
  {
    id: '4',
    question: "What's the difference between the monthly and yearly plans?",
    answer:
      'Both plans offer our core features, but the yearly plan provides a significant discount and increases your mock interview count from 20 to 300 for the year, offering the best value.',
    category: 'pricing',
  },
  {
    id: '5',
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel your subscription at any time. You will retain access to the features until the end of your current billing period.',
    category: 'pricing',
  },
  {
    id: '6',
    question: 'Who is Talxify for?',
    answer:
      'Talxify is for software engineering students, recent graduates, and professional developers who want to sharpen their interview skills and land their dream job in the tech industry.',
    category: 'general',
  },
  {
    id: '7',
    question: 'What technologies do you support for coding questions?',
    answer:
      'Currently, our coding gym is optimized for JavaScript, but we are actively working on expanding our language support to include Python, Java, and more.',
    category: 'technical',
  },
  {
    id: '8',
    question: 'How do I get support if I have an issue?',
    answer:
      'Both our monthly and yearly plans come with 24/7 customer support. You can reach out to us via the contact form on our website or through the support channel in your dashboard.',
    category: 'support',
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'technical', label: 'Technical' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'support', label: 'Support' },
];

export default function LandingFaq() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaqs =
    activeCategory === 'all'
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="bg-transparent py-10" id="faq">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative mb-10 flex flex-col items-center text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-1"
          >
            <ShieldQuestion size={14} className="fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Help Center</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-black tracking-tight italic uppercase md:text-4xl lg:text-5xl text-foreground leading-[0.9]"
          >
            Common <span className="text-primary">Questions.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm sm:text-base font-medium max-w-xl mx-auto italic"
          >
            Find quick answers to help you prepare for your next big interview.
          </motion.p>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all italic border',
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                  : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:border-border hover:text-foreground',
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={cn(
                  'group relative overflow-hidden rounded-[1.5rem] border-border/50 dark:border-white/10 transition-all duration-500 bg-card/40 dark:bg-black/40 backdrop-blur-xl',
                  expandedId === faq.id
                    ? 'shadow-2xl shadow-primary/5 ring-1 ring-primary/20'
                    : 'hover:bg-card/60 hover:border-primary/20 hover:shadow-xl',
                )}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="flex w-full items-center justify-between p-5 sm:p-6 text-left relative z-10"
                >
                  <h3 className={cn(
                    "text-base font-black italic uppercase tracking-tighter transition-colors leading-tight pr-4",
                    expandedId === faq.id ? "text-primary" : "text-foreground group-hover:text-primary/80"
                  )}>
                    {faq.question}
                  </h3>
                  <div className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500",
                    expandedId === faq.id ? "bg-primary text-primary-foreground rotate-180" : "bg-muted/50 text-muted-foreground"
                  )}>
                    {expandedId === faq.id ? (
                      <MinusIcon className="h-3.5 w-3.5" />
                    ) : (
                      <PlusIcon className="h-3.5 w-3.5" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden relative z-10"
                    >
                      <div className="px-6 sm:px-8 pb-8">
                        <p className="text-muted-foreground font-medium italic leading-relaxed pt-2 border-t border-border/20">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Background Decoration */}
                <div className={cn(
                  "absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full transition-opacity duration-700",
                  expandedId === faq.id ? "opacity-100" : "opacity-0"
                )} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-14 text-center"
        >
          <div className="inline-block p-1 rounded-2xl bg-muted/30 dark:bg-white/5 border border-border/50 backdrop-blur-md">
            <div className="px-8 py-6 rounded-xl bg-background/40 dark:bg-black/40 border border-border/30 flex flex-col sm:flex-row items-center gap-6">
              <div className="text-left">
                <p className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-tight">Need more help?</p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic">Our support team is active 24/7 for premium members.</p>
              </div>
              <Button asChild size="lg" className="h-12 px-6 rounded-xl bg-primary hover:scale-105 transition-all font-black uppercase tracking-widest italic text-xs shadow-lg shadow-primary/20">
                <Link href="/#contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
