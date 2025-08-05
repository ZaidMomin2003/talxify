
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center">
          <span className="sr-only">Talxify</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Button asChild variant="outline">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome to Talxify</h1>
            <p className="text-muted-foreground">Your AI-powered coding and mock interview platform.</p>
        </div>
      </main>
    </div>
  );
}
