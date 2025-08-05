
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import { Menu, X, ArrowRight, Bot } from 'lucide-react';
import { useAuth } from "@/context/auth-context";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: 'Features', href: '/#features' },
  { name: 'Testimonials', href: '/#testimonials' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'FAQ', href: '/#faq' },
  { name: 'About', href: '/about' },
];

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const targetId = href.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If on a different page, navigate and then scroll
        window.location.href = href;
      }
    }
    setIsMobileMenuOpen(false);
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
            : 'bg-transparent text-white'
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
                  <span className="text-lg font-bold">
                    Talxify
                  </span>
                  <span className={`text-xs -mt-1 ${isScrolled ? 'text-muted-foreground' : 'text-slate-400'}`}>AI Job Assistant</span>
                </div>
              </Link>
            </motion.div>

            <nav className="hidden items-center space-x-1 lg:flex">
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
                    className="relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {hoveredItem === item.name && (
                      <motion.div
                        className="bg-muted absolute inset-0 rounded-lg"
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
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
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
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Sign In
                  </Link>
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
              className="p-2 transition-colors duration-200 lg:hidden"
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
              className="border-border bg-background fixed top-16 right-4 z-50 w-80 overflow-hidden rounded-2xl border shadow-2xl lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="space-y-6 p-6">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <motion.div key={item.name} variants={mobileItemVariants}>
                      <Link
                        href={item.href}
                        className="block rounded-lg px-4 py-3 font-medium transition-colors duration-200"
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
                        className="bg-foreground text-background block w-full rounded-lg py-3 text-center font-medium transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Go to Dashboard
                      </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block w-full rounded-lg py-3 text-center font-medium transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="bg-foreground text-background block w-full rounded-lg py-3 text-center font-medium transition-all duration-200"
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
