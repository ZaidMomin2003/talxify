
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Bot, ChevronDown, Building, DollarSign, Calculator, Book, Info, Sparkles, TrendingUp, Zap, Globe, Rocket } from 'lucide-react';
import { useAuth } from "@/context/auth-context";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

interface MegaItem {
  name: string;
  href: string;
  icon: any;
  description: string;
  badge?: string;
}

const partnershipItems: MegaItem[] = [
  { name: 'Partnership', href: '/institutepartnership', icon: Building, description: 'Institutional scale collaboration protocols.', badge: 'University' },
  { name: 'Affiliate Elite', href: '/earn-money', icon: DollarSign, description: 'High-ticket ecosystem for top creators.' },
  { name: 'The Vision', href: '/about', icon: Info, description: 'Our mission and the elite team behind Talxify.' },
];

const toolsItems: MegaItem[] = [
  { name: 'Salary Matrix', href: '/salary-calculator', icon: Calculator, description: 'AI-powered market value assessment.' },
  { name: 'Intelligence', href: '/blog', icon: Book, description: 'Industry insights and interview strategy.' },
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
    <header className={cn(
      "fixed top-0 right-0 left-0 z-[100] transition-all duration-500",
      isScrolled ? "py-2" : "py-4"
    )}>
      {/* Top Banner (Optional/Refined) */}
      {!isScrolled && (
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-primary via-red-500 to-primary/80 flex items-center justify-center overflow-hidden">
          <motion.div
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-4 px-4"
          >
            <p className="text-[10px] sm:text-[11px] font-black text-white tracking-[0.2em] uppercase italic flex items-center gap-2">
              <Zap size={12} className="fill-white" />
              Accelerated by <Link href="https://aws.amazon.com/startups/" target="_blank" className="underline decoration-white/30 underline-offset-2 hover:decoration-white transition-colors">AWS Startups</Link>
              <Zap size={12} className="fill-white" />
            </p>
          </motion.div>
        </div>
      )}

      <div className={cn(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative",
        !isScrolled && "mt-14"
      )}>
        <div className={cn(
          "flex h-24 items-center justify-between px-8 rounded-[2.5rem] transition-all duration-500 border border-transparent",
          isScrolled ? "bg-black/60 backdrop-blur-3xl border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]" : "bg-transparent"
        )}>
          {/* Logo Area */}
          <Link href="/" className="flex items-center space-x-3 group relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all duration-500 rounded-full" />
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-red-600 shadow-2xl group-hover:rotate-[360deg] transition-all duration-700 relative z-10">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                Talxify
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary italic leading-tight">Mastery Engine</span>
            </div>
          </Link>

          {/* Desktop Nav - Central Pill */}
          <nav className="hidden items-center lg:flex absolute left-1/2 -translate-x-1/2">
            <div className="flex bg-zinc-950/20 backdrop-blur-2xl rounded-full border border-white/5 p-2 gap-3 shadow-2xl ring-1 ring-white/[0.02]">
              <Link
                href="/#features"
                onClick={(e) => handleLinkClick(e, '/#features')}
                className="px-8 py-2.5 text-[11px] font-black uppercase italic tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-full transition-all duration-500"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                onClick={(e) => handleLinkClick(e, '/#pricing')}
                className="px-8 py-2.5 text-[11px] font-black uppercase italic tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-full transition-all duration-500"
              >
                Pricing
              </Link>

              {/* Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMega('tools')}
                onMouseLeave={() => setActiveMega(null)}
              >
                <button className={cn(
                  "flex items-center gap-3 px-8 py-2.5 text-[11px] font-black uppercase italic tracking-[0.2em] transition-all duration-500 rounded-full hover:bg-white/[0.05]",
                  activeMega === 'tools' ? "text-white bg-white/[0.05]" : "text-zinc-400"
                )}>
                  Tools <ChevronDown size={14} className={cn("transition-transform duration-500", activeMega === 'tools' ? "rotate-180 text-primary" : "")} />
                </button>

                <AnimatePresence>
                  {activeMega === 'tools' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-5 w-[420px]"
                    >
                      <div className="bg-[#080808]/95 border border-white/10 backdrop-blur-3xl rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] overflow-hidden p-8 relative">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] pointer-events-none" />
                        <div className="flex flex-col gap-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2 italic">Intelligence Terminal</p>
                          {toolsItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={(e) => handleLinkClick(e, item.href)}
                              className="group/item flex items-center gap-5 p-5 rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 border border-transparent hover:border-white/5"
                            >
                              <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-primary p-3.5 rounded-2xl shadow-xl group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-500 ring-1 ring-white/5">
                                <item.icon size={22} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[15px] font-black italic uppercase tracking-tight text-white">{item.name}</span>
                                <span className="text-[11px] font-medium italic text-zinc-500 line-clamp-1">{item.description}</span>
                              </div>
                              <ArrowRight size={18} className="ml-auto opacity-0 -translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-500 text-primary" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Partnership Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMega('partnership')}
                onMouseLeave={() => setActiveMega(null)}
              >
                <button className={cn(
                  "flex items-center gap-3 px-8 py-2.5 text-[11px] font-black uppercase italic tracking-[0.2em] transition-all duration-500 rounded-full hover:bg-white/[0.05]",
                  activeMega === 'partnership' ? "text-white bg-white/[0.05]" : "text-zinc-400"
                )}>
                  Partners <ChevronDown size={14} className={cn("transition-transform duration-500", activeMega === 'partnership' ? "rotate-180 text-primary" : "")} />
                </button>

                <AnimatePresence>
                  {activeMega === 'partnership' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-5 w-[420px]"
                    >
                      <div className="bg-[#080808]/95 border border-white/10 backdrop-blur-3xl rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] overflow-hidden p-8 relative">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/10 blur-[80px] pointer-events-none" />
                        <div className="flex flex-col gap-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2 italic">Collaboration Nodes</p>
                          {partnershipItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={(e) => handleLinkClick(e, item.href)}
                              className="group/item flex items-center gap-5 p-5 rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 border border-transparent hover:border-white/5"
                            >
                              <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-primary p-3.5 rounded-2xl shadow-xl group-hover/item:scale-110 group-hover/item:-rotate-3 transition-all duration-500 ring-1 ring-white/5">
                                <item.icon size={22} />
                              </div>
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[15px] font-black italic uppercase tracking-tight text-white">{item.name}</span>
                                  {item.badge && <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[8px] font-black uppercase tracking-tighter italic border border-primary/20 leading-none">{item.badge}</span>}
                                </div>
                                <span className="text-[11px] font-medium italic text-zinc-500 line-clamp-1">{item.description}</span>
                              </div>
                              <ArrowRight size={18} className="ml-auto opacity-0 -translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-500 text-primary" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden items-center space-x-5 lg:flex relative z-10">
            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-2xl bg-white/5 border border-white/10"></div>
            ) : user ? (
              <Button asChild className="rounded-2xl h-11 px-7 font-black uppercase italic tracking-[0.1em] shadow-[0_15px_30px_-10px_rgba(230,57,70,0.5)] bg-gradient-to-r from-primary to-red-600 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 border-none group">
                <Link href="/dashboard" className="flex items-center">
                  Dashboard <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[11px] font-black uppercase italic tracking-[0.3em] text-zinc-500 hover:text-white transition-colors py-2"
                >
                  Sign In
                </Link>
                <Button asChild className="rounded-2xl h-12 px-8 font-black uppercase italic tracking-[0.1em] shadow-[0_20px_40px_-15px_rgba(230,57,70,0.6)] bg-gradient-to-r from-primary to-red-600 hover:shadow-primary/50 hover:scale-[1.03] active:scale-95 transition-all duration-500 border-none group">
                  <Link href="/signup" className="flex items-center">
                    Get Started <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Display Toggle */}
          <button
            className="p-3 lg:hidden text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 relative z-10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Futuristic Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-3xl lg:hidden flex flex-col p-8 pt-28"
          >
            <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="flex flex-col space-y-2 relative z-10 overflow-y-auto pb-10">
              <Link
                href="/#features"
                onClick={(e) => handleLinkClick(e, '/#features')}
                className="text-4xl font-black italic uppercase tracking-tighter text-white py-4 border-b border-white/5 flex justify-between items-center group active:text-primary"
              >
                Features <ArrowRight className="text-zinc-800 group-active:text-primary transition-colors" />
              </Link>
              <Link
                href="/#pricing"
                onClick={(e) => handleLinkClick(e, '/#pricing')}
                className="text-4xl font-black italic uppercase tracking-tighter text-white py-4 border-b border-white/5 flex justify-between items-center group active:text-primary"
              >
                Pricing <ArrowRight className="text-zinc-800 group-active:text-primary transition-colors" />
              </Link>

              <div className="pt-10 grid grid-cols-1 gap-6">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Intelligence Terminal</p>
                <div className="grid grid-cols-2 gap-4">
                  {toolsItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.03] border border-white/5 active:bg-primary/10 active:border-primary/20 transition-all"
                    >
                      <item.icon size={22} className="text-primary" />
                      <span className="text-sm font-black italic uppercase tracking-tight text-white">{item.name}</span>
                    </Link>
                  ))}
                  {partnershipItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.03] border border-white/5 active:bg-primary/10 active:border-primary/20 transition-all"
                    >
                      <item.icon size={22} className="text-primary" />
                      <span className="text-sm font-black italic uppercase tracking-tight text-white">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-20 flex flex-col space-y-4">
                {user ? (
                  <Button asChild size="lg" className="w-full rounded-2xl font-black uppercase italic tracking-[0.2em] h-16 bg-primary text-white text-lg">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="lg" className="w-full rounded-2xl font-black uppercase italic tracking-[0.2em] h-16 border-white/10 bg-white/5 text-white">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild size="lg" className="w-full rounded-2xl font-black uppercase italic tracking-[0.2em] h-16 bg-primary text-white text-lg shadow-2xl shadow-primary/30">
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
