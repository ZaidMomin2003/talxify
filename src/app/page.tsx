
'use client';

import LandingHero from "./landing-hero";
import LandingFeatures from "./landing-features";
import LandingTestimonials from "./landing-testimonials";
import LandingPricing from "./landing-pricing";
import LandingFaq from "./landing-faq";
import LandingCta from "./landing-cta";
import LandingContact from "./landing-contact";
import LandingFooter from "./landing-footer";
import React from 'react';
import LandingHeader from "./landing-header";
import EntryPopup from "@/components/entry-popup";


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
       <LandingHeader />
       <EntryPopup />
      <main className="flex-1">
        <LandingHero />
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
