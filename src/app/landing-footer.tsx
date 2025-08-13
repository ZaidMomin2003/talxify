
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="bg-card/30 border-t border-border/50">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Branding and Newsletter */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Bot size={24} />
                </div>
                <h2 className="text-2xl font-headline font-bold text-foreground">
                Talxify
                </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Ace your next tech interview with AI-powered assistance.
            </p>
            <form className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email for newsletter" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 lg:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold tracking-wider uppercase text-foreground">
                Product
              </h3>
              <ul className="space-y-3">
                <li><Link href="/#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="/#pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><Link href="/#testimonials" className="text-muted-foreground hover:text-primary">Testimonials</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link></li>
              </ul>
            </div>
             <div>
              <h3 className="mb-4 font-semibold tracking-wider uppercase text-foreground">
                Legal
              </h3>
              <ul className="space-y-3">
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/refund-policy" className="text-muted-foreground hover:text-primary">Refund Policy</Link></li>
                <li><Link href="/shipping-policy" className="text-muted-foreground hover:text-primary">Service Delivery</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold tracking-wider uppercase text-foreground">
                Account
              </h3>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-muted-foreground hover:text-primary">Login</Link></li>
                <li><Link href="/signup" className="text-muted-foreground hover:text-primary">Sign Up</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary">Forgot Password</Link></li>
                 <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/50 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Talxify, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
