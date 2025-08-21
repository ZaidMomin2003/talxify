
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


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
       <LandingHeader />
      <main className="flex-1">
        <AppHero />
        
        {/* Video Section */}
        <section id="see-in-action" className="py-16 sm:py-24 bg-background">
            <div className="container mx-auto max-w-5xl px-4 md:px-6 text-center">
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
                    Watch a quick walkthrough to see how our AI-powered tools can help you prepare for your next technical interview and land your dream job.
                </p>
                <div className="aspect-video overflow-hidden rounded-2xl border border-border shadow-2xl shadow-primary/10">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/3tXVSpImzXk?si=YOUR_SHARE_CODE"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </section>

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
