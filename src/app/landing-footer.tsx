
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="bg-card/30 border-t border-border/50 relative z-20">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Branding */}
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
                <li><Link href="/salary-calculator" className="text-muted-foreground hover:text-primary">Salary Calculator</Link></li>
                <li><Link href="/#testimonials" className="text-muted-foreground hover:text-primary">Testimonials</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link></li>
              </ul>
            </div>
             <div>
              <h3 className="mb-4 font-semibold tracking-wider uppercase text-foreground">
                Company
              </h3>
              <ul className="space-y-3">
                 <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                 <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                 <li><Link href="/institutepartnership" className="text-muted-foreground hover:text-primary">For Institutes</Link></li>
                 <li><Link href="/#contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
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
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/50 pt-8 flex flex-col items-center justify-between gap-6 md:flex-row">
           <div className="text-xs text-muted-foreground text-center md:text-left">
                <p className="font-semibold text-foreground">Disclaimer</p>
                <p>Talxify is an advanced AI-powered educational platform designed to dramatically increase your interview performance. While we cannot guarantee job offers, our tools provide the rigorous practice needed to give you a significant competitive edge. AI-generated content should be used as a guide and cross-verified when making critical decisions.</p>
            </div>
          <p className="text-sm text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} Talxify, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
