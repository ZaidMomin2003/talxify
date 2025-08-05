import { Button } from "@/components/ui/button";
import Link from "next/link";
import LandingHero from "./landing-hero";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center font-headline font-bold text-xl">
          Talxify
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Button asChild variant="ghost">
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <LandingHero />
      </main>
    </div>
  );
}
