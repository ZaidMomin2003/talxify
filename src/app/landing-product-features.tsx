"use client";

/**
 * @author: @dorianbaffier
 * @description: Bento Grid
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Mic,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Anthropic from "@/components/icons/anthropic";
import AnthropicDark from "@/components/icons/anthropic-dark";
import DeepSeek from "@/components/icons/deepseek";
import Google from "@/components/icons/gemini";
import MistralAI from "@/components/icons/mistral";
import OpenAI from "@/components/icons/open-ai";
import OpenAIDark from "@/components/icons/open-ai-dark";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icons?: boolean;
  href?: string;
  feature?:
  | "chart"
  | "counter"
  | "code"
  | "timeline"
  | "spotlight"
  | "icons"
  | "typing"
  | "metrics";
  spotlightItems?: string[];
  timeline?: Array<{ year: string; event: string }>;
  code?: string;
  codeLang?: string;
  typingText?: string;
  metrics?: Array<{
    label: string;
    value: number;
    suffix?: string;
    color?: string;
  }>;
  statistic?: {
    value: string;
    label: string;
    start?: number;
    end?: number;
    suffix?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const bentoItems: BentoItem[] = [
  {
    id: "main",
    title: "Master Every Interview",
    description:
      "Talxify's core engine uses advanced AI to simulate high-pressure interview scenarios across 50+ technical domains.",
    feature: "spotlight",
    spotlightItems: [
      "Real-time Behavioral Analysis",
      "Technical Deep-Dives",
      "Instant Score Feedback",
      "Role-Specific Scenarios",
      "Weakness Identification",
    ],
    size: "lg",
    className: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
  },
  {
    id: "stat1",
    title: "AI Coding Gymnasium",
    description:
      "Solve complex algorithms while our AI watches your logic, providing line-by-line feedback just like a real interviewer.",
    feature: "typing",
    typingText:
      "// AI analyzing your solution...\nfunction findOptimalPath(grid) {\n  const n = grid.length;\n  const dp = Array(n).fill(Infinity);\n  \n  // Optimized Dynamic Programming\n  for(let i = 0; i < n; i++) {\n    dp[i] = Math.min(dp[i-1], grid[i]);\n  }\n  \n  return dp[n-1];\n}",
    size: "md",
    className: "col-span-2 row-span-1 col-start-1 col-end-3",
  },
  {
    id: "partners",
    title: "Intelligence Layer",
    description:
      "Powered by the world's most sophisticated LLMs, fine-tuned specifically for career coaching and code evaluation.",
    icons: true,
    feature: "icons",
    size: "md",
    className: "col-span-1 row-span-1",
  },
  {
    id: "innovation",
    title: "The 60-Day Sprint",
    description:
      "Follow our proven AI-driven roadmap to transform from a candidate to a top-tier industry professional.",
    feature: "timeline",
    timeline: [
      { year: "Phase 1", event: "Foundations & Blindspots" },
      { year: "Phase 2", event: "Deep Technical Mastery" },
      { year: "Phase 3", event: "System Design & Architecture" },
      { year: "Phase 4", event: "Mock Interview Marathon" },
      {
        year: "Phase 5",
        event: "Career Ready & Portfolio Deployment",
      },
    ],
    size: "sm",
    className: "col-span-1 row-span-1",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const SpotlightFeature = ({ items }: { items: string[] }) => (
  <ul className="mt-2 space-y-1.5">
    {items.map((item, index) => (
      <motion.li
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        key={`spotlight-${item.toLowerCase().replace(/\s+/g, "-")}`}
        transition={{ delay: 0.1 * index }}
      >
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
        <span className="text-muted-foreground text-sm">
          {item}
        </span>
      </motion.li>
    ))}
  </ul>
);

const CounterAnimation = ({
  start,
  end,
  suffix = "",
}: {
  start: number;
  end: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    let currentFrame = 0;
    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easedProgress = 1 - (1 - progress) ** 3;
      const current = start + (end - start) * easedProgress;

      setCount(Math.min(current, end));

      if (currentFrame === totalFrames) {
        clearInterval(counter);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [start, end]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="font-bold text-3xl text-foreground">
        {count.toFixed(1).replace(/\.0$/, "")}
      </span>
      <span className="font-medium text-foreground text-xl">
        {suffix}
      </span>
    </div>
  );
};

const ChartAnimation = ({ value }: { value: number }) => (
  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
    <motion.div
      animate={{ width: `${value}%` }}
      className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
      initial={{ width: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    />
  </div>
);

const IconsFeature = () => {
  const logos = [
    { src: "/chatgpt.png", label: "OpenAI" },
    { src: "/claude.png", label: "Claude" },
    { src: "/Google-Gemini-Logo-Transparent.png", label: "Gemini", className: "scale-150" },
    { src: "/Mistral-Ai-Unique-Graphic-Representation-PNG.png", label: "Mistral", className: "invert brightness-200" },
    { src: "/deepseek-logo-01.png", label: "DeepSeek" },
    { label: "More", isPlus: true }
  ];

  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {logos.map((item, idx) => (
        <motion.div
          key={idx}
          className="group flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="relative flex h-10 w-full items-center justify-center">
            {item.isPlus ? (
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            ) : (
              <img
                src={item.src}
                alt={item.label}
                className={cn(
                  "h-8 w-auto object-contain transition-all duration-300 group-hover:scale-110",
                  item.className
                )}
              />
            )}
          </div>
          <span className="text-center font-bold text-[9px] text-muted-foreground group-hover:text-primary uppercase tracking-tighter transition-colors">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const TimelineFeature = ({
  timeline,
}: {
  timeline: Array<{ year: string; event: string }>;
}) => (
  <div className="relative mt-3">
    <div className="absolute top-0 bottom-0 left-[9px] w-[2px] bg-white/10" />
    {timeline.map((item) => (
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className="relative mb-3 flex gap-3"
        initial={{ opacity: 0, x: -10 }}
        key={`timeline-${item.year}-${item.event
          .toLowerCase()
          .replace(/\s+/g, "-")}`}
        transition={{
          delay: 0.1,
        }}
      >
        <div className="z-10 mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 border-primary/30 bg-black shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
        <div>
          <div className="font-bold text-primary text-[10px] uppercase tracking-widest">
            {item.year}
          </div>
          <div className="text-foreground font-semibold text-xs">
            {item.event}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const TypingCodeFeature = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(
        () => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);

          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        },
        Math.random() * 20 + 5
      );

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, []);

  return (
    <div className="relative mt-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-primary/70 text-[10px] font-bold uppercase tracking-widest">
          AI_ANALYTICS.log
        </div>
      </div>
      <div
        className="h-[150px] overflow-y-auto rounded-xl bg-black border border-white/10 p-4 font-mono text-primary text-[11px]"
        ref={terminalRef}
      >
        <pre className="whitespace-pre-wrap leading-relaxed">
          {displayedText}
          <span className="animate-pulse text-white">_</span>
        </pre>
      </div>
    </div>
  );
};

const MetricsFeature = ({
  metrics,
}: {
  metrics: Array<{
    label: string;
    value: number;
    suffix?: string;
    color?: string;
  }>;
}) => {
  return (
    <div className="mt-3 space-y-3">
      {metrics.map((metric, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
          initial={{ opacity: 0, y: 10 }}
          key={`metric-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}
          transition={{ delay: 0.15 * index }}
        >
          <div className="flex items-center justify-between text-sm text-foreground">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
              {metric.label === "Uptime" && <Clock className="h-3.5 w-3.5" />}
              {metric.label === "Response time" && (
                <Zap className="h-3.5 w-3.5" />
              )}
              {metric.label === "Cost reduction" && (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {metric.label}
            </div>
            <div className="font-bold">
              {metric.value}
              {metric.suffix}
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              animate={{
                width: `${Math.min(100, metric.value)}%`,
              }}
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                delay: 0.15 * index,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

function AIInput_Voice() {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (submitted) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, 3000);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo]);

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      setSubmitted((prev) => !prev);
    }
  };

  return (
    <div className="w-full py-4">
      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-4">
        <button
          className={cn(
            "group flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-300",
            submitted
              ? "bg-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.3)]"
              : "bg-white/5 hover:bg-white/10"
          )}
          onClick={handleClick}
          type="button"
        >
          {submitted ? (
            <div
              className="pointer-events-auto h-8 w-8 animate-spin cursor-pointer rounded-lg bg-primary"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="h-8 w-8 text-white/50 group-hover:text-primary transition-colors" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-xl font-bold transition-opacity duration-300",
            submitted
              ? "text-primary"
              : "text-white/20"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="flex h-6 w-72 items-center justify-center gap-1.5">
          {[...Array(32)].map((_, i) => (
            <div
              className={cn(
                "w-1 rounded-full transition-all duration-300",
                submitted
                  ? "animate-pulse bg-primary"
                  : "h-2 bg-white/5"
              )}
              key={`voice-bar-${i}`}
              style={
                submitted && isClient
                  ? {
                    height: `${30 + Math.random() * 70}%`,
                    animationDelay: `${i * 0.05}s`,
                  }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-primary/70">
          {submitted ? "AI LISTENING..." : "VOICE RECOGNITION READY"}
        </p>
      </div>
    </div>
  );
}

const BentoCard = ({ item }: { item: BentoItem }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]);
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      className="h-full"
      onHoverEnd={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      variants={fadeInUp}
      whileHover={{ y: -5 }}
    >
      <div
        className={`group relative flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out hover:border-primary/40 hover:bg-black/60 ${item.className}`}
      >
        <div
          className="relative z-10 flex h-full flex-col gap-4"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex flex-1 flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-2xl tracking-tighter uppercase italic transition-colors duration-300 group-hover:text-primary">
                {item.title}
              </h3>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              {item.description}
            </p>

            {/* Feature specific content */}
            {item.feature === "spotlight" && item.spotlightItems && (
              <SpotlightFeature items={item.spotlightItems} />
            )}

            {item.feature === "counter" && item.statistic && (
              <div className="mt-auto pt-3 text-primary">
                <CounterAnimation
                  end={item.statistic.end || 100}
                  start={item.statistic.start || 0}
                  suffix={item.statistic.suffix}
                />
              </div>
            )}

            {item.feature === "chart" && item.statistic && (
              <div className="mt-auto pt-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    {item.statistic.label}
                  </span>
                  <span className="font-black text-primary text-xl">
                    {item.statistic.end}
                    {item.statistic.suffix}
                  </span>
                </div>
                <ChartAnimation value={item.statistic.end || 0} />
              </div>
            )}

            {item.feature === "timeline" && item.timeline && (
              <TimelineFeature timeline={item.timeline} />
            )}

            {item.feature === "icons" && <IconsFeature />}

            {item.feature === "typing" && item.typingText && (
              <TypingCodeFeature text={item.typingText} />
            )}

            {item.feature === "metrics" && item.metrics && (
              <MetricsFeature metrics={item.metrics} />
            )}
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 rounded-3xl -z-10" />
      </div>
    </motion.div>
  );
};

export default function LandingProductFeatures() {
  return (
    <section className="relative overflow-hidden bg-transparent py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-16 text-center">
          <Badge variant="outline" className="border-primary text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-4">
            AI Core Features
          </Badge>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase mb-6">
            Future-Proof Your <span className="text-primary">Career</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg font-medium">
            Next-generation AI tools designed to push your professional limits and secure your place at the world's most innovative companies.
          </p>
        </div>

        {/* Bento Grid */}
        <motion.div
          className="grid gap-6"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true }}
          whileInView="visible"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[0]} />
            </motion.div>
            <motion.div className="md:col-span-2" variants={fadeInUp}>
              <BentoCard item={bentoItems[1]} />
            </motion.div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[2]} />
            </motion.div>
            <motion.div
              className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-primary/40 hover:bg-black/60 md:col-span-1 group"
              variants={fadeInUp}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-white text-2xl tracking-tighter uppercase italic transition-colors duration-300 group-hover:text-primary">
                    Behavioral Voice Analysis
                  </h3>
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <p className="mb-8 text-muted-foreground text-sm font-medium leading-relaxed">
                  Real-time sentiment and tone analysis during your practice sessions. Speak naturally, and let our AI coach you on delivery, confidence, and keyword placement.
                </p>
                <div className="mt-auto">
                  <AIInput_Voice />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
