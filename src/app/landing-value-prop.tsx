
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
    <section className="bg-transparent py-16 sm:py-24" id="value">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <Badge
            variant="outline"
            className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
          >
            Unbeatable Value
          </Badge>
          <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
            One Platform, Every Tool You Need
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            Stop juggling multiple subscriptions. Talxify combines the best features of top prep tools into a single, affordable platform.
          </p>
        </motion.div>

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
                className="rounded-xl border bg-card/50 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-foreground">{app.name}</p>
                  <p className="font-bold text-lg">₹{app.price.toLocaleString('en-IN')}<span className="text-sm text-muted-foreground">/mo</span></p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {app.features.map(feature => (
                    <Badge key={feature} variant="secondary" className="font-normal">{feature}</Badge>
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
            className="rounded-2xl border-2 border-primary bg-primary/10 p-8 text-center shadow-2xl shadow-primary/10"
          >
            <p className="text-muted-foreground mb-2">Total monthly cost of other platforms:</p>
            <p className="text-4xl font-bold text-foreground line-through decoration-destructive decoration-2 mb-4">
              ₹{totalCost.toLocaleString('en-IN')}
            </p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <DollarSign size={28} />
              </div>
              <p className="text-5xl font-bold text-primary">₹4999</p>
            </div>
            <p className="text-2xl font-semibold text-foreground mb-1">2 Months Pro</p>
            <p className="text-muted-foreground mb-6">Our most popular plan. No recurring fees.</p>

            <Button asChild size="lg" className="w-full group">
              <Link href="/#pricing">
                Get Started & Save
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">10x your chance of cracking the interview.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
