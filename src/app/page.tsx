
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
import LandingHowItWorks from "./landing-how-it-works";
import Image from "next/image";


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
       <LandingHeader />
      <main className="flex-1">
        <AppHero />
        
        <LandingHowItWorks />
        
        {/* Video Section */}
        <section id="see-in-action" className="py-16 sm:py-24 bg-background">
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
                <div className="h-[80vh] overflow-hidden rounded-2xl border border-border shadow-2xl shadow-primary/10">
                    <Image
                      src="/image.png"
                      alt="Talxify in action"
                      width={1920}
                      height={1080}
                      className="w-full h-full object-contain"
                      data-ai-hint="product screenshot"
                    />
                </div>
            </div>
        </section>
        
        <LandingProductFeatures />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFaq />
        <section id="contact" className="py-16 flex justify-center px-4">
          <LandingCta />
        </section>
        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  );
}
