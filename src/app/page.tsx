
'use client';

import AppHero from "./landing-hero";
import LandingFeatures from "./landing-features";
import LandingTestimonials from "./landing-testimonials";
import LandingPricing from "./landing-pricing";
import LandingFaq from "./landing-faq";
import LandingCta from "./landing-cta";
import LandingContact from "./landing-contact";
import React from 'react';
import LandingHeader from "./landing-header";
import LandingFooter from "./landing-footer";
import { Badge } from "@/components/ui/badge";
import LandingProductFeatures from "./landing-product-features";
import LandingFeatureSteps from "./landing-feature-steps";
import Image from "next/image";
import LandingValueProposition from "./landing-value-prop";


import LandingCreator from "./landing-creator";


export default function LandingPage() {
  return (
    <div className="dark flex flex-col min-h-screen bg-black overflow-x-hidden relative text-white">
      <div className="absolute inset-0 z-0 h-full w-full rotate-180 items-center px-5 py-24 opacity-80 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#e63946_100%)]"></div>
      <svg
        id="noice"
        className="absolute inset-0 z-10 h-full w-full opacity-30"
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.34"
            numOctaves="4"
            stitchTiles="stitch"
          ></feTurbulence>
          <feColorMatrix type="saturate" values="0"></feColorMatrix>
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.46"></feFuncR>
            <feFuncG type="linear" slope="0.46"></feFuncG>
            <feFuncB type="linear" slope="0.47"></feFuncB>
            <feFuncA type="linear" slope="0.37"></feFuncA>
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.47" intercept="-0.23" />
            <feFuncG type="linear" slope="1.47" intercept="-0.23" />
            <feFuncB type="linear" slope="1.47" intercept="-0.23" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)"></rect>
      </svg>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-black/70 to-gray-950 blur-3xl"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>
      </div>
      <LandingHeader />
      <main className="flex-1 relative z-20">
        <AppHero />

        {/* Video Section */}
        <section id="see-in-action" className="py-16 sm:py-24 bg-transparent">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center">
            <Badge
              variant="outline"
              className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
            >
              See It in Action
            </Badge>
            <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
              Experience Talxify Firsthand
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              Our AI-powered tools can help you prepare for your next technical interview and land your dream job.
            </p>
            <div className="relative group mx-auto max-w-7xl">
              {/* Browser Window UI */}
              <div className="relative rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl overflow-hidden shadow-primary/20 transition-all duration-500 group-hover:border-primary/20">
                {/* Browser Header */}
                <div className="flex items-center h-10 px-4 bg-gradient-to-b from-white/10 to-transparent border-b border-white/10 gap-4">
                  {/* Traffic Lights */}
                  <div className="flex gap-1.5 pb-0.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>

                  {/* Address Bar */}
                  <div className="flex-1 flex justify-center">
                    <div className="bg-black/40 border border-white/5 rounded-md px-4 py-0.5 text-[11px] text-gray-400 font-medium flex items-center gap-2 min-w-[240px] justify-center backdrop-blur-md">
                      <div className="w-3 h-3 rounded-full bg-white/5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                      </div>
                      talxify.space
                    </div>
                  </div>

                  {/* Spacer for symmetry */}
                  <div className="w-16" />
                </div>

                {/* Screenshot Content */}
                <div className="w-full">
                  <Image
                    src="/image.png"
                    alt="Talxify in action"
                    width={1920}
                    height={1080}
                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                    priority
                  />
                </div>
              </div>

              {/* Bottom reflection/glow effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-primary/5 blur-[100px] rounded-full -z-10" />
            </div>
          </div>
        </section>

        <LandingFeatureSteps />

        <LandingProductFeatures />
        {/* <LandingTestimonials /> */}
        <LandingPricing />
        <LandingValueProposition />
        <LandingFaq />
        <section id="cta" className="py-16 flex justify-center px-4">
          <LandingCta />
        </section>

        <LandingCreator />

        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  );
}

