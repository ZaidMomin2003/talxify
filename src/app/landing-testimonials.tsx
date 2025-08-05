
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Marquee } from '@/components/ui/marquee';

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
  img?: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function TestimonialCard({
  description,
  name,
  img,
  role,
  className,
  ...props // Capture the rest of the props
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4',
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
        <img
          width={40}
          height={40}
          src={img || ''}
          alt={name}
          className="size-10 rounded-full ring-1 ring-primary/20 ring-offset-2"
        />

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
    name: 'Sarah L.',
    role: 'Software Engineer at TechCorp',
    img: 'https://randomuser.me/api/portraits/women/33.jpg',
    description: (
      <p>
        Talxify was a game-changer for my interview prep.
        <Highlight>
          The AI mock interviews felt incredibly realistic and helped me pinpoint my weaknesses.
        </Highlight>{' '}
        I walked into my real interviews with so much more confidence.
      </p>
    ),
  },
  {
    name: 'David C.',
    role: 'Frontend Developer',
    img: 'https://randomuser.me/api/portraits/men/22.jpg',
    description: (
      <p>
        The AI coding assistant is brilliant.
        <Highlight>
          It doesn't just give you answers; it helps you understand the logic.
        </Highlight>{' '}
        I was able to get unstuck on complex algorithm problems much faster.
      </p>
    ),
  },
  {
    name: 'Emily T.',
    role: 'CS Student at State University',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
    description: (
      <p>
        As a student, getting relevant interview practice is tough.
        <Highlight>Talxify's targeted quizzes were perfect for my coursework.</Highlight> The performance analytics showed me exactly where I needed to focus my studies.
      </p>
    ),
  },
  {
    name: 'Michael P.',
    role: 'Backend Engineer',
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
    description: (
      <p>
        I used Talxify to prepare for a senior role.
        <Highlight>
          The system design questions were spot-on and the feedback was insightful.
        </Highlight>{' '}
        It's the best prep tool I've come across.
      </p>
    ),
  },
  {
    name: 'Jessica R.',
    role: 'Full-Stack Developer',
    img: 'https://randomuser.me/api/portraits/women/67.jpg',
    description: (
      <p>
        The portfolio builder is a fantastic bonus.
        <Highlight>
          It automatically showcased my solved problems and quiz results.
        </Highlight>{' '}
        I included the link in my resume and got great feedback from recruiters.
      </p>
    ),
  },
  {
    name: 'Kevin N.',
    role: 'Data Scientist',
    img: 'https://randomuser.me/api/portraits/men/55.jpg',
    description: (
      <p>
        The variety of questions on Talxify is impressive.
        <Highlight>
          From basic data structures to advanced machine learning concepts.
        </Highlight>{' '}
        It kept me challenged and well-prepared for anything.
      </p>
    ),
  },
];

const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));


export default function LandingTestimonials() {
  return (
    <section className="relative container py-10 bg-background">
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
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r"></div>
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l"></div>
      </div>
    </section>
  );
}
