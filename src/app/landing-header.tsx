
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Bot, ChevronDown, Building, DollarSign, Calculator, Book, Info, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from "@/context/auth-context";
import { usePathname } from 'next/navigation';

interface MegaItem {
  name: string;
  href: string;
  icon: any;
  description: string;
}

const partnershipItems: MegaItem[] = [
  { name: 'Partnership', href: '/institutepartnership', icon: Building, description: 'Institutional collaboration protocols.' },
  { name: 'Earn Money', href: '/earn-money', icon: DollarSign, description: 'Join our high-ticket affiliate ecosystem.' },
  { name: 'About Us', href: '/about', icon: Info, description: 'Our mission and the elite team behind Talxify.' },
];

const toolsItems: MegaItem[] = [
  { name: 'Salary Calc', href: '/salary-calculator', icon: Calculator, description: 'AI-powered market value assessment.' },
  { name: 'Blog', href: '/blog', icon: Book, description: 'Industry insights and interview strategy.' },
];

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<'partnership' | 'tools' | null>(null);
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMega(null);
  }, [pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
    setActiveMega(null);
  };

  return (
    <header className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${isScrolled ? 'border-b border-border/40 bg-background/70 backdrop-blur-xl' : 'bg-transparent'
      }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                Talxify
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">AI Assistant</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center space-x-2 lg:flex">
            <Link href="/#features" onClick={(e) => handleLinkClick(e, '/#features')} className="px-4 py-2 text-sm font-bold uppercase italic tracking-widest text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="/#pricing" onClick={(e) => handleLinkClick(e, '/#pricing')} className="px-4 py-2 text-sm font-bold uppercase italic tracking-widest text-muted-foreground hover:text-primary transition-colors">Pricing</Link>

            {/* Partnership Mega Menu */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveMega('partnership')}
              onMouseLeave={() => setActiveMega(null)}
            >
              <button className={`flex items-center gap-1 px-4 py-2 text-sm font-bold uppercase italic tracking-widest transition-colors ${activeMega === 'partnership' ? 'text-primary' : 'text-muted-foreground'}`}>
                Partners <ChevronDown size={14} className={`transition-transform duration-300 ${activeMega === 'partnership' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeMega === 'partnership' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[380px]"
                  >
                    <div className="bg-background/95 border border-border/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-6 grid grid-cols-1 gap-2">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-primary">
                        <Building size={120} />
                      </div>
                      {partnershipItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={(e) => handleLinkClick(e, item.href)}
                          className="group/item flex items-center gap-4 p-4 rounded-3xl hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/20"
                        >
                          <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover/item:scale-110 transition-transform">
                            <item.icon size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black italic uppercase tracking-tight text-foreground">{item.name}</span>
                            <span className="text-[10px] font-medium italic text-muted-foreground">{item.description}</span>
                          </div>
                          <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-primary" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tools Mega Menu */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveMega('tools')}
              onMouseLeave={() => setActiveMega(null)}
            >
              <button className={`flex items-center gap-1 px-4 py-2 text-sm font-bold uppercase italic tracking-widest transition-colors ${activeMega === 'tools' ? 'text-primary' : 'text-muted-foreground'}`}>
                Tools <ChevronDown size={14} className={`transition-transform duration-300 ${activeMega === 'tools' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeMega === 'tools' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[380px]"
                  >
                    <div className="bg-background/95 border border-border/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-6 grid grid-cols-1 gap-2">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-primary">
                        <TrendingUp size={120} />
                      </div>
                      {toolsItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={(e) => handleLinkClick(e, item.href)}
                          className="group/item flex items-center gap-4 p-4 rounded-3xl hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/20"
                        >
                          <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover/item:scale-110 transition-transform">
                            <item.icon size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black italic uppercase tracking-tight text-foreground">{item.name}</span>
                            <span className="text-[10px] font-medium italic text-muted-foreground">{item.description}</span>
                          </div>
                          <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-primary" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Auth Actions */}
          <div className="hidden items-center space-x-4 lg:flex">
            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-xl bg-muted"></div>
            ) : user ? (
              <Button asChild className="rounded-xl h-12 px-6 font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="font-bold uppercase italic tracking-widest text-muted-foreground hover:text-foreground">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="rounded-xl h-12 px-6 font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  <Link href="/signup">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="p-2 lg:hidden text-foreground hover:bg-muted rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-border p-6 lg:hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex flex-col space-y-4">
              <Link href="/#features" onClick={(e) => handleLinkClick(e, '/#features')} className="text-lg font-black italic uppercase tracking-tighter text-foreground py-2 border-b border-border/50">Features</Link>
              <Link href="/#pricing" onClick={(e) => handleLinkClick(e, '/#pricing')} className="text-lg font-black italic uppercase tracking-tighter text-foreground py-2 border-b border-border/50">Pricing</Link>

              <p className="text-[10px] font-bold uppercase tracking-widest text-primary italic pt-4">Partnership</p>
              {partnershipItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="flex items-center gap-3 text-lg font-black italic uppercase tracking-tighter text-foreground/80 py-2 border-b border-border/50 pl-2"
                >
                  <item.icon size={18} className="text-primary" />
                  {item.name}
                </Link>
              ))}

              <p className="text-[10px] font-bold uppercase tracking-widest text-primary italic pt-4">Tools & Content</p>
              {toolsItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="flex items-center gap-3 text-lg font-black italic uppercase tracking-tighter text-foreground/80 py-2 border-b border-border/50 pl-2"
                >
                  <item.icon size={18} className="text-primary" />
                  {item.name}
                </Link>
              ))}

              <div className="pt-8 flex flex-col space-y-3">
                {user ? (
                  <Button asChild size="lg" className="w-full rounded-2xl font-black uppercase italic tracking-widest h-14">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="lg" className="w-full rounded-2xl font-black uppercase italic tracking-widest h-14">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild size="lg" className="w-full rounded-2xl font-black uppercase italic tracking-widest h-14">
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
