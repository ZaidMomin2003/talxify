
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import { Menu, X, ArrowRight, Bot, MessageSquare, Code, BrainCircuit, FileText, User, Swords, ChevronDown, Sparkles, UserRound, Check, DollarSign } from 'lucide-react';
import { useAuth } from "@/context/auth-context";
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  // Features and Pricing are now handled separately
  { name: 'Salary Calculator', href: '/salary-calculator' },
  { name: 'Testimonials', href: '/#testimonials' },
  { name: 'FAQ', href: '/#faq' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'For Institutes', href: '/institutepartnership' },
];

const featureItems = [
    { name: '60-Day Prep Arena', href: '/#features', icon: Swords, description: "Personalized syllabus to master key concepts." },
    { name: 'AI Mock Interviews', href: '/#features', icon: MessageSquare, description: 'Practice with a realistic AI that asks relevant questions.' },
    { name: 'AI Coding Gym', href: '/#features', icon: Code, description: 'Solve problems with instant, line-by-line feedback.' },
    { name: 'AI Study Notes', href: '/#features', icon: BrainCircuit, description: 'Generate in-depth study guides for any topic.' },
    { name: 'Resume Builder', href: '/#features', icon: FileText, description: 'Craft a professional resume with our easy-to-use tool.' },
    { name: 'Portfolio Builder', href: '/#features', icon: User, description: 'Showcase your skills with an automatically generated portfolio.' },
];

const freePlanFeatures = [
    'First Day of 60-Day Arena',
    'AI-Powered Mock Interview',
    'AI-Analyzed Coding Quiz',
    'Limited Portfolio Access (24h)',
];

const proPlanFeatures = [
    'Full 60-Day Arena Access',
    'Unlimited Coding Questions',
    'Professional Resume Builder',
    'Full Portfolio Customization',
    'And everything in Free...',
];


export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
  const [isPricingMenuOpen, setIsPricingMenuOpen] = useState(false);
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
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const targetId = href.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = href;
      }
    }
    setIsMobileMenuOpen(false);
    setIsFeaturesMenuOpen(false);
    setIsPricingMenuOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
        staggerChildren: 0.1,
      },
    },
  };
  
   const megaMenuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
  };


  const mobileItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'border-border/50 bg-background/80 border-b shadow-sm backdrop-blur-md'
            : 'bg-transparent'
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">
                    Talxify
                  </span>
                   <span className="text-xs -mt-1 text-muted-foreground">AI Job Assistant</span>
                </div>
              </Link>
            </motion.div>

            <nav className="hidden items-center space-x-1 lg:flex">
               <motion.div
                    onMouseEnter={() => setIsFeaturesMenuOpen(true)}
                    onMouseLeave={() => setIsFeaturesMenuOpen(false)}
                    className="relative"
                    variants={itemVariants}
                >
                    <div
                      className={`relative flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 text-foreground cursor-pointer hover:bg-destructive/10 hover:text-destructive`}
                    >
                      <span>Features</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFeaturesMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                     <AnimatePresence>
                        {isFeaturesMenuOpen && (
                            <motion.div
                                variants={megaMenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max origin-top"
                            >
                                <div className="bg-background border border-border rounded-xl shadow-lg p-4">
                                     <div className="grid grid-cols-2 gap-4 w-[34rem]">
                                        {featureItems.map(item => (
                                            <Link 
                                                key={item.name} 
                                                href={item.href} 
                                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted focus:bg-muted focus:outline-none transition-colors"
                                                onClick={(e) => handleLinkClick(e, item.href)}
                                            >
                                                <div className="bg-primary/10 text-primary rounded-md p-2 mt-0.5">
                                                    <item.icon className="w-5 h-5"/>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                
                <motion.div
                    onMouseEnter={() => setIsPricingMenuOpen(true)}
                    onMouseLeave={() => setIsPricingMenuOpen(false)}
                    className="relative"
                    variants={itemVariants}
                >
                    <div
                      className={`relative flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 text-foreground cursor-pointer hover:bg-destructive/10 hover:text-destructive`}
                    >
                      <span>Pricing</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPricingMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                     <AnimatePresence>
                        {isPricingMenuOpen && (
                            <motion.div
                                variants={megaMenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max origin-top"
                            >
                                <div className="bg-background border border-border rounded-xl shadow-lg grid grid-cols-2 w-[36rem]">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <UserRound className="w-6 h-6 text-muted-foreground"/>
                                            <h3 className="font-bold text-lg">Free</h3>
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-4">A glimpse into our powerful platform, forever free.</p>
                                        <ul className="space-y-2 text-sm mb-6">
                                            {freePlanFeatures.map(f => (
                                                <li key={f} className="flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0"/>
                                                    <span className="text-muted-foreground">{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                         <Button asChild variant="secondary" className="w-full" onClick={() => setIsPricingMenuOpen(false)}>
                                            <Link href="/signup">Start for Free</Link>
                                        </Button>
                                    </div>
                                    <div className="p-6 bg-primary/5 border-l">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Sparkles className="w-6 h-6 text-primary"/>
                                            <h3 className="font-bold text-lg">Pro</h3>
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-4">Unlock your full potential and land your dream job.</p>
                                        <ul className="space-y-2 text-sm mb-6">
                                             {proPlanFeatures.map(f => (
                                                <li key={f} className="flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0"/>
                                                    <span className="text-muted-foreground">{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button asChild className="w-full" onClick={() => setIsPricingMenuOpen(false)}>
                                            <Link href="/#pricing">Choose Plan</Link>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>


              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 text-foreground`}
                  >
                    {hoveredItem === item.name && (
                      <motion.div
                        className="bg-destructive/20 absolute inset-0 rounded-lg"
                        layoutId="navbar-hover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              className="hidden items-center space-x-3 lg:flex"
              variants={itemVariants}
            >
              {loading ? (
                <div className="h-9 w-32 animate-pulse rounded-md bg-muted"></div>
              ) : user ? (
                 <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button asChild>
                      <Link href="/dashboard">
                        <span>Dashboard</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
              ) : (
                <>
                   <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button asChild variant="ghost">
                        <Link href="/login">
                            <span>Sign In</span>
                        </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button asChild>
                      <Link href="/signup">
                        <span>Get Started</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>

            <motion.button
              className={`p-2 transition-colors duration-200 lg:hidden text-foreground`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="border-border bg-background fixed top-4 right-4 z-50 w-80 overflow-hidden rounded-2xl border shadow-2xl lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="space-y-6 p-6">
                <div className="space-y-1">
                   <motion.div variants={mobileItemVariants}>
                     <Link
                        href="/#features"
                        className="block rounded-lg px-4 py-3 font-medium transition-colors duration-200 hover:bg-muted"
                        onClick={(e) => handleLinkClick(e, '/#features')}
                      >
                        Features
                      </Link>
                   </motion.div>
                   <motion.div variants={mobileItemVariants}>
                     <Link
                        href="/#pricing"
                        className="block rounded-lg px-4 py-3 font-medium transition-colors duration-200 hover:bg-muted"
                        onClick={(e) => handleLinkClick(e, '/#pricing')}
                      >
                        Pricing
                      </Link>
                   </motion.div>
                  {navItems.map((item) => (
                    <motion.div key={item.name} variants={mobileItemVariants}>
                      <Link
                        href={item.href}
                        className="block rounded-lg px-4 py-3 font-medium transition-colors duration-200 hover:bg-muted"
                        onClick={(e) => handleLinkClick(e, item.href)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="border-border space-y-3 border-t pt-6"
                  variants={mobileItemVariants}
                >
                  {user ? (
                      <Link
                        href="/dashboard"
                        className="bg-primary text-primary-foreground block w-full rounded-lg py-3 text-center font-medium transition-all duration-200 hover:bg-primary/90"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Go to Dashboard
                      </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block w-full rounded-lg py-3 text-center font-medium transition-colors duration-200 hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="bg-primary text-primary-foreground block w-full rounded-lg py-3 text-center font-medium transition-all duration-200 hover:bg-primary/90"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
