

'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Bot, Code, Briefcase, BarChart, Github, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const getFriendlyAuthErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'The email address you entered is not valid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to too many failed login attempts. You can reset your password or try again later.';
    default:
      return 'An unexpected error occurred during sign-in. Please try again.';
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn({ email, password });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login Error Code:", error.code);
      const friendlyMessage = getFriendlyAuthErrorMessage(error.code);
      toast({
        title: "Sign-in failed",
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
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Google sign-in failed",
        description: error.message || "Could not sign in with Google.",
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
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "GitHub sign-in failed",
        description: error.message || "Could not sign in with GitHub.",
        variant: "destructive",
      });
    } finally {
      setGithubLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists for this email, you will receive instructions to reset your password. Please also check your spam folder.",
        duration: 7000
      });
      setIsForgotPassOpen(false);
      setResetEmail("");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists for this email, you will receive instructions to reset your password. Please also check your spam folder.",
        duration: 7000
      });
      setIsForgotPassOpen(false);
    } finally {
      setResetLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background selection:bg-primary/30 selection:text-white transition-colors duration-500">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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
                    Master Your <br />
                    <span className="text-primary italic">Next Interview.</span>
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-lg text-muted-foreground font-medium italic max-w-sm"
                  >
                    Practice with AI-powered mock interviews and get the job you deserve.
                  </motion.p>
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                {[
                  { icon: <Briefcase size={18} />, title: 'Mock Interviews', desc: 'Real-time voice and coding practice.' },
                  { icon: <BarChart size={18} />, title: 'Detailed Feedback', desc: 'Analyze your performance instantly.' },
                ].map(({ icon, title, desc }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-card dark:bg-white/5 border border-border dark:border-white/5 backdrop-blur-md group/item hover:bg-muted dark:hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover/item:scale-110 transition-transform duration-300">
                      {icon}
                    </div>
                    <div>
                      <div className="font-bold text-foreground uppercase italic tracking-wider text-sm">{title}</div>
                      <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">{desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Decorative circle */}
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
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground mb-2">
                    Welcome <span className="text-primary">Back.</span>
                  </h2>
                  <p className="text-muted-foreground font-medium italic text-sm">
                    Log in to your account and continue practicing.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassOpen(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary italic transition-colors"
                      >
                        Reset?
                      </button>
                    </div>
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
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest text-base shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group/btn disabled:opacity-70 disabled:hover:scale-100"
                    disabled={loading || googleLoading || githubLoading}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Log In <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#0d0d0d] px-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Or continue with</span>
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

                <div className="mt-10 text-center">
                  <p className="text-zinc-500 font-medium italic text-sm">
                    Don't have an account? {' '}
                    <Link href="/signup" className="text-primary font-black italic uppercase tracking-widest text-xs hover:text-primary/80 transition-colors ml-1 inline-flex items-center group/link">
                      Sign Up <ChevronRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
        <DialogContent className="bg-[#0d0d0d] border border-white/10 text-white rounded-[2rem] max-w-md p-8 overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full -z-10" />

          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter mb-2">Reset <span className="text-primary">Password.</span></DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium italic">
              Enter your email and we'll send you reset instructions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic pl-1">Email Address</label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 text-white font-medium italic"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-3 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="rounded-xl font-bold uppercase tracking-widest text-xs text-zinc-500 hover:text-white hover:bg-white/5">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs h-12 px-6"
            >
              {resetLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Send Reset Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
