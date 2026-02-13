
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';
import { Marquee } from '@/components/ui/marquee';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'bg-primary/10 p-1 py-0.5 font-bold text-primary',
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface TestimonialCardProps {
  name: string;
  role: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function TestimonialCard({
  description,
  name,
  role,
  className,
  ...props // Capture the rest of the props
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'mb-4 flex w-[350px] cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4',
        // theme styles
        'border-border bg-card/50 border shadow-sm',
        // hover effect
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
      {...props}
    >
      <div className="text-muted-foreground text-sm font-normal select-none">
        {description}
        <div className="flex flex-row py-1">
          <Star className="size-4 fill-primary text-primary" />
          <Star className="size-4 fill-primary text-primary" />
          <Star className="size-4 fill-primary text-primary" />
          <Star className="size-4 fill-primary text-primary" />
          <Star className="size-4 fill-primary text-primary" />
        </div>
      </div>

      <div className="flex w-full items-center justify-start gap-5 select-none">
        <Avatar className="size-10 rounded-full ring-1 ring-primary/20 ring-offset-2">
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>

        <div>
          <p className="text-foreground font-medium">{name}</p>
          <p className="text-muted-foreground text-xs font-normal">{role}</p>
        </div>
      </div>
    </div>
  );
}
const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'SDE at a Bangalore startup',
    description: (
      <p>
        Talxify was a game-changer for my prep.
        The AI mock interviews felt incredibly realistic and helped build my confidence.
      </p>
    ),
  },
  {
    name: 'Rohan Gupta',
    role: 'Frontend Developer at Wipro',
    description: (
      <p>
        The AI coding assistant is brilliant.
        It not only checks my solution but helps me understand the core logic.
      </p>
    ),
  },
  {
    name: 'Ananya Reddy',
    role: 'CS Student at IIT Bombay',
    description: (
      <p>
        Getting relevant interview practice is tough for campus placements.
        Talxify's targeted quizzes were perfect.
      </p>
    ),
  },
  {
    name: 'Vikram Singh',
    role: 'Backend Engineer at Infosys',
    description: (
      <p>
        I used Talxify to prepare for a senior role.
        The system design questions were spot-on and very relevant to what I was asked.
      </p>
    ),
  },
  {
    name: 'Sneha Patel',
    role: 'Full-Stack Developer, Pune',
    description: (
      <p>
        The portfolio builder is a fantastic bonus.
        It automatically showcased my solved problems from the Arena.
      </p>
    ),
  },
  {
    name: 'Aditya Kumar',
    role: 'Data Scientist, Hyderabad',
    description: (
      <p>
        The variety of questions on Talxify is impressive.
        It kept me challenged and well-prepared for multiple company rounds.
      </p>
    ),
  },
];

const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));


export default function LandingTestimonials() {
  return (
    <section className="relative container py-10 bg-transparent" id="testimonials">
      {/* Decorative elements */}
      <div className="absolute top-20 -left-20 z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-20 bottom-20 z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-foreground mb-4 text-center text-4xl leading-[1.2] font-bold tracking-tighter md:text-5xl">
          Loved by Developers Everywhere
        </h2>
        <h3 className="text-muted-foreground mx-auto mb-8 max-w-lg text-center text-lg font-medium tracking-tight text-balance">
          Don&apos;t just take our word for it. Here&apos;s what{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            real users
          </span>{' '}
          are saying about{' '}
          <span className="font-semibold text-primary">Talxify</span>
        </h3>
      </motion.div>

      <div className="relative mt-12 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {secondRow.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </Marquee>
        <div className="from-transparent pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r"></div>
        <div className="from-transparent pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l"></div>
      </div>
    </section>
  );
}
