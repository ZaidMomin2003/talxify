
'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, DollarSign, X } from 'lucide-react';
import Link from 'next/link';

const replacedApps = [
  { name: 'LeetCode Premium', price: 2900, features: ['Problem Access', 'Company Questions'] },
  { name: 'AlgoExpert', price: 8200, features: ['Curated Questions', 'Video Explanations'] },
  { name: 'Interviewing.io', price: 18000, features: ['Mock Interviews', 'Anonymous Practice'] },
  { name: 'Grammarly Premium', price: 2500, features: ['Resume Writing', 'Clarity'] },
];

const totalCost = replacedApps.reduce((acc, app) => acc + app.price, 0);

export default function LandingValueProposition() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <section className="bg-transparent py-12 sm:py-20" id="value">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative mb-12 flex flex-col items-center text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-1"
          >
            <DollarSign size={14} className="fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Best Savings</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-black tracking-tight italic uppercase md:text-4xl lg:text-5xl text-foreground leading-[0.9]"
          >
            The Smartest <span className="text-primary">Choice.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm sm:text-base font-medium max-w-xl mx-auto italic"
          >
            Stop paying for multiple tools. Get everything you need for interview prep in one place.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Replaced Apps Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {replacedApps.map((app) => (
              <motion.div
                key={app.name}
                variants={itemVariants}
                className="rounded-[2rem] border-border dark:border-white/10 bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-destructive/5 blur-3xl rounded-full" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <p className="font-black italic uppercase tracking-tighter text-xl text-foreground leading-none">{app.name}</p>
                    <p className="text-[10px] font-black text-destructive uppercase tracking-widest mt-1 italic">Monthly Cost</p>
                  </div>
                  <p className="font-black italic tracking-tighter text-2xl text-foreground">₹{app.price.toLocaleString('en-IN')}<span className="text-[10px] uppercase ml-1 opacity-50">/mo</span></p>
                </div>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {app.features.map(feature => (
                    <Badge key={feature} variant="secondary" className="bg-muted dark:bg-white/5 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 italic">{feature}</Badge>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Talxify Value Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-[2rem] border-primary/30 dark:border-primary/20 bg-primary/10 dark:bg-primary/5 p-8 text-center shadow-[0_0_50px_rgba(var(--primary),0.1)] backdrop-blur-3xl relative overflow-hidden h-full flex flex-col justify-center"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
              <Check size={140} className="text-primary" />
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground italic mb-1 relative z-10">Average Market Cost</p>
            <p className="text-3xl font-black italic tracking-tighter text-foreground/40 line-through decoration-destructive decoration-4 mb-6 relative z-10">
              ₹{totalCost.toLocaleString('en-IN')}
            </p>

            <div className="bg-background/40 dark:bg-black/40 border border-primary/20 rounded-[1.8rem] p-6 mb-6 relative z-10 shadow-lg">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary italic mb-3">Talxify Choice</p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-5xl font-black italic tracking-tighter text-primary">₹4999</p>
              </div>
              <p className="text-lg font-black italic uppercase tracking-tighter text-foreground mb-1 leading-none">Full Pro Access</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none opacity-60">One-time Payment</p>
            </div>

            <Button asChild size="lg" className="w-full h-14 rounded-xl bg-primary hover:scale-[1.01] transition-all font-black uppercase tracking-widest italic text-base shadow-lg shadow-primary/20 group relative z-10">
              <Link href="/#pricing">
                Save Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
