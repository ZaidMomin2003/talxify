
'use client';

import {
  BrainCircuit,
  BarChart,
  Code,
  Sparkles,
  Trophy,
  User,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the feature item type
type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  position?: 'left' | 'right';
  cornerStyle?: string;
};

// Create feature data arrays for left and right columns
const leftFeatures: FeatureItem[] = [
  {
    icon: BrainCircuit,
    title: 'AI Mock Interviews',
    description:
      'Practice with a realistic AI interviewer that asks relevant questions and provides real-time feedback.',
    position: 'left',
    cornerStyle: 'sm:translate-x-4 sm:rounded-br-[2px]',
  },
  {
    icon: User,
    title: 'Personalized Coaching',
    description:
      'Our AI analyzes your performance to provide tailored advice on where to improve.',
    position: 'left',
    cornerStyle: 'sm:-translate-x-4 sm:rounded-br-[2px]',
  },
  {
    icon: Code,
    title: 'Live Coding Assistant',
    description:
      'Get hints, debug your code, and receive explanations for complex problems on the fly.',
    position: 'left',
    cornerStyle: 'sm:translate-x-4 sm:rounded-tr-[2px]',
  },
];

const rightFeatures: FeatureItem[] = [
  {
    icon: BarChart,
    title: 'Performance Analytics',
    description:
      'Track your progress over time with detailed dashboards and metrics on your skills.',
    position: 'right',
    cornerStyle: 'sm:-translate-x-4 sm:rounded-bl-[2px]',
  },
  {
    icon: Trophy,
    title: 'Targeted Practice',
    description:
      'Generate quizzes and interview questions based on specific job roles and technologies.',
    position: 'right',
    cornerStyle: 'sm:translate-x-4 sm:rounded-bl-[2px]',
  },
  {
    icon: Sparkles,
    title: 'Portfolio Builder',
    description:
      'Automatically create a professional portfolio to showcase your skills and completed challenges.',
    position: 'right',
    cornerStyle: 'sm:-translate-x-4 sm:rounded-tl-[2px]',
  },
];

// Feature card component
const FeatureCard = ({ feature }: { feature: FeatureItem }) => {
  const Icon = feature.icon;

  return (
    <div>
      <div
        className={cn(
          'relative rounded-2xl px-4 pt-4 pb-4 text-sm',
          'bg-card/50 ring-border ring-1',
          feature.cornerStyle,
        )}
      >
        <div className="text-primary mb-3 text-[2rem]">
          <Icon />
        </div>
        <h2 className="text-foreground mb-2.5 text-2xl font-headline">{feature.title}</h2>
        <p className="text-muted-foreground text-base text-pretty">
          {feature.description}
        </p>
        {/* Decorative elements */}
        <span className="from-primary/0 via-primary to-primary/0 absolute -bottom-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r opacity-60"></span>
        <span className="absolute inset-0 bg-[radial-gradient(30%_5%_at_50%_100%,hsl(var(--primary)/0.15)_0%,transparent_100%)] opacity-60"></span>
      </div>
    </div>
  );
};

export default function LandingFeatures() {
  return (
    <section className="bg-background text-foreground pt-20 pb-8" id="features">
      <div className="mx-6 max-w-[1120px] pt-2 pb-16 max-[300px]:mx-4 min-[1150px]:mx-auto">
        <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {leftFeatures.map((feature, index) => (
              <FeatureCard key={`left-feature-${index}`} feature={feature} />
            ))}
          </div>

          {/* Center column */}
          <div className="order-[1] mb-6 self-center sm:order-[0] md:mb-0">
            <div className="bg-card/80 text-foreground ring-border relative mx-auto mb-4.5 w-fit rounded-full rounded-bl-[2px] px-4 py-2 text-sm ring-1">
              <span className="relative z-10 flex items-center gap-2">
                Our Features
              </span>
              <span className="from-primary/0 via-primary to-primary/0 absolute -bottom-px left-1/2 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r"></span>
              <span className="absolute inset-0 bg-[radial-gradient(30%_40%_at_50%_100%,hsl(var(--primary)/0.25)_0%,transparent_100%)]"></span>
            </div>
            <h2 className="text-foreground font-headline mb-2 text-center text-2xl sm:mb-2.5 md:text-[2rem]">
              Why You'll Love Talxify
            </h2>
            <p className="text-muted-foreground mx-auto max-w-[18rem] text-center text-pretty">
              Everything you need to prepare for your tech interview, all in one place.
            </p>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {rightFeatures.map((feature, index) => (
              <FeatureCard key={`right-feature-${index}`} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
