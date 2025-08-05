import { Button } from "@/components/ui/button";
import Link from "next/link";
import LandingHero from "./landing-hero";
import LandingFeatures from "./landing-features";
import LandingTestimonials from "./landing-testimonials";
import LandingPricing from "./landing-pricing";
import LandingFaq from "./landing-faq";
import LandingCta from "./landing-cta";
import LandingContact from "./landing-contact";
import LandingFooter from "./landing-footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <header className="px-4 lg:px-6 h-14 flex items-center fixed top-0 w-full z-50 bg-black/50 backdrop-blur-sm text-white">
        <Link href="#" className="flex items-center justify-center font-headline font-bold text-xl">
          Talxify
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Button asChild variant="ghost" className="hover:bg-white/10 hover:text-white">
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button asChild className="bg-white text-black hover:bg-white/90">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFaq />
        <section className="py-16 flex justify-center px-4">
          <LandingCta />
        </section>
        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  );
}
