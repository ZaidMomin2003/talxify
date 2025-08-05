
'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";


export default function LandingCta() {
  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-[40px] bg-primary p-6 sm:p-10 md:p-20">
      <div className="absolute inset-0 hidden h-full w-full overflow-hidden md:block">
        <div className="absolute top-1/2 right-[-45%] aspect-square h-[800px] w-[800px] -translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-primary/80 opacity-30"></div>
          <div className="absolute inset-0 scale-[0.8] rounded-full bg-primary/60 opacity-30"></div>
          <div className="absolute inset-0 scale-[0.6] rounded-full bg-primary/40 opacity-30"></div>
          <div className="absolute inset-0 scale-[0.4] rounded-full bg-primary/20 opacity-30"></div>
          <div className="absolute inset-0 scale-[0.2] rounded-full bg-primary/10 opacity-30"></div>
          <div className="absolute inset-0 scale-[0.1] rounded-full bg-white/50 opacity-30"></div>
        </div>
      </div>

      <div className="relative z-10">
        <h1 className="mb-3 text-3xl font-bold text-primary-foreground sm:text-4xl md:mb-4 md:text-5xl">
          Ready to Land Your Dream Job?
        </h1>
        <p className="mb-6 max-w-md text-base text-primary-foreground/90 sm:text-lg md:mb-8">
          Start preparing today with AI-powered mock interviews and coding assistance. Your next career move is just a click away.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
           <Button asChild
                className="group rounded-full bg-primary-foreground px-6 py-6 text-primary shadow-lg transition-all hover:bg-primary-foreground/90"
                size="lg"
              >
                <Link href="/signup">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
            <Button asChild
                variant="outline"
                className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                size="lg"
              >
                <Link href="#features">
                  Explore Features
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
