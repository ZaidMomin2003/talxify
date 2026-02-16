
'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Bot, Code, Briefcase, BarChart, Github, User, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const getFriendlyAuthErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email address is already in use by another account.';
    case 'auth/invalid-email':
      return 'The email address you entered is not valid.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-up is not currently enabled.';
    case 'auth/weak-password':
      return 'The password is too weak. It must be at least 6 characters long.';
    default:
      return 'An unexpected error occurred during sign-up. Please try again.';
  }
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp({ name, email, password });
      router.push('/onboarding');
    } catch (error: any) {
      console.error("Signup Error Code:", error.code);
      const friendlyMessage = getFriendlyAuthErrorMessage(error.code);
      toast({
        title: "Sign-up failed",
        description: friendlyMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push('/onboarding');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Google sign-up failed",
        description: error.message || "Could not sign up with Google.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signInWithGitHub();
      router.push('/onboarding');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "GitHub sign-up failed",
        description: error.message || "Could not sign up with GitHub.",
        variant: "destructive",
      });
    } finally {
      setGithubLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background selection:bg-primary/30 selection:text-white transition-colors duration-500">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="z-10 w-full max-w-5xl px-4"
      >
        <div className="group relative bg-card/40 dark:bg-[#0d0d0d]/80 backdrop-blur-2xl overflow-hidden rounded-[2.5rem] shadow-2xl border border-border dark:border-white/5 lg:grid lg:grid-cols-2">
          {/* Left Side: Brand Panel */}
          <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-border dark:border-white/5 bg-muted/30 dark:bg-[#0a0a0a]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

            <div className="relative z-10">
              <Link href="/" className="flex items-center gap-4 mb-16 group/logo w-fit">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-blue-600 shadow-[0_0_20px_rgba(230,57,70,0.3)] group-hover/logo:scale-110 group-hover/logo:shadow-[0_0_35px_rgba(230,57,70,0.5)] transition-all duration-500 animate-vivid-gradient [background-size:200%_200%]">
                  <Bot className="h-8 w-8 text-white relative z-10" />
                  <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                  <div className="absolute -inset-1 blur-xl bg-primary/20 rounded-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">Talxify</h1>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1.5 italic">AI Job Assistant</span>
                </div>
              </Link>

              <div className="space-y-6">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-5xl font-black italic uppercase tracking-tight leading-[0.9] text-foreground"
                >
                  Build Your <br />
                  <span className="text-primary italic">Dream Career.</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-lg text-muted-foreground font-medium italic max-w-sm"
                >
                  Create your account and start practicing with our AI interviewer today.
                </motion.p>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {[
                { icon: <Briefcase size={18} />, title: 'Mock Interviews', desc: 'Real-time practice with AI.' },
                { icon: <Code size={18} />, title: 'Coding Practice', desc: 'Solve challenges with live feedback.' },
              ].map(({ icon, title, desc }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md group/item hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover/item:scale-110 transition-transform duration-300">
                    {icon}
                  </div>
                  <div>
                    <div className="font-bold text-white uppercase italic tracking-wider text-sm">{title}</div>
                    <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Right Side: Form Panel */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-10 text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-6 lg:hidden">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                    <Bot size={28} />
                  </div>
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                  Create <span className="text-primary">Account.</span>
                </h2>
                <p className="text-zinc-500 font-medium italic text-sm">
                  Sign up in seconds and start preparing.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pl-1 italic">
                    Full Name
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-primary transition-colors duration-300">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-primary/50 focus:bg-white/[0.08] focus:ring-0 focus:outline-none transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pl-1 italic">
                    Email Address
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-primary transition-colors duration-300">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-primary/50 focus:bg-white/[0.08] focus:ring-0 focus:outline-none transition-all duration-300"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pl-1 italic">
                    Password
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-primary transition-colors duration-300">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-12 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-primary/50 focus:bg-white/[0.08] focus:ring-0 focus:outline-none transition-all duration-300"
                      placeholder="Secure Password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest text-base shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group/btn disabled:opacity-70 mt-4"
                  disabled={loading || googleLoading || githubLoading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#0d0d0d] px-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading || githubLoading}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 text-white font-bold tracking-tight hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    {googleLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="h-5 w-5 mr-3" alt="Google" />
                        <span>Google</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGitHubSignIn}
                    disabled={loading || googleLoading || githubLoading}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 text-white font-bold tracking-tight hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    {githubLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        <Github className="h-5 w-5 mr-3" />
                        <span>GitHub</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center font-medium italic text-sm">
                <span className="text-zinc-500">Already have an account?</span>{' '}
                <Link href="/login" className="text-primary font-black italic uppercase tracking-widest text-xs hover:text-primary/80 transition-colors ml-1 inline-flex items-center group/link">
                  Log In <ChevronRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
