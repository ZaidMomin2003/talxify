
'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Bot, Code, Briefcase, BarChart, Github } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { SignInForm } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn({ email, password });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Sign-in failed",
        description: error.message || "An unexpected error occurred.",
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
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for instructions to reset your password." });
      setIsForgotPassOpen(false);
      setResetEmail("");
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "Failed to send password reset email.", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };


  return (
    <>
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 bg-background">
      <div className="z-10 w-full max-w-6xl">
        <div className="bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-lg border border-border/20 md:rounded-3xl lg:grid lg:grid-cols-2">
          {/* Left Side */}
          <div className="brand-side relative hidden lg:block m-4 rounded-xl bg-[url('/popup.png')] bg-cover p-12 text-white" data-ai-hint="abstract technology">
            <div className='absolute inset-0 bg-primary/80 rounded-xl'></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center gap-3 mb-12">
                        <Bot size={32} />
                        <h1 className="text-3xl font-headline font-bold">Talxify</h1>
                    </div>
                    <h2 className="mb-4 text-5xl font-bold font-headline leading-tight">
                    Win your interviews with AI Assistance.
                    </h2>
                    <p className="mb-12 text-lg opacity-80">
                    AI-powered mock interviews and coding assistance to land your dream job.
                    </p>
                </div>
                <div className="space-y-6">
                  {[
                    { icon: <Briefcase size={16} />, title: 'AI Mock Interviews', desc: 'Practice with an AI that simulates real interviews.' },
                    { icon: <Code size={16} />, title: 'Coding Assistant', desc: 'Get hints, explanations, and code reviews.' },
                    { icon: <BarChart size={16} />, title: 'Performance Analytics', desc: 'Track your progress and identify weak spots.' },
                  ].map(({ icon, title, desc }, i) => (
                    <div key={i} className="flex items-center">
                      <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        {icon}
                      </div>
                      <div>
                        <div className="font-semibold">{title}</div>
                        <div className="text-sm opacity-70">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot size={32} />
                  </div>
                </div>
                <h2 className="text-3xl font-bold font-headline text-foreground">
                  Welcome Back
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to continue your journey with Talxify.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="block w-full rounded-md border border-input bg-transparent py-3 pr-3 pl-10 text-sm placeholder:text-muted-foreground focus:ring-ring focus:ring-2 focus:outline-none"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                      className="block w-full rounded-md border border-input bg-transparent py-3 pr-12 pl-10 text-sm placeholder:text-muted-foreground focus:ring-ring focus:ring-2 focus:outline-none"
                      placeholder="Enter your password"
                    />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-muted-foreground flex items-center text-sm">
                    <input type="checkbox" className="border-border text-primary h-4 w-4 rounded focus:ring-primary" />
                    <span className="ml-2">Remember me</span>
                  </label>
                  <button type="button" onClick={() => setIsForgotPassOpen(true)} className="text-primary hover:text-primary/80 text-sm font-medium">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading || googleLoading || githubLoading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                </Button>

                <div className="relative text-center text-sm text-muted-foreground">
                  <div className="absolute inset-0 flex items-center"> <div className="w-full border-t border-border"></div></div>
                  <span className="relative bg-card px-2">Or continue with</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading || googleLoading || githubLoading}>
                        {googleLoading ? <Loader2 className="animate-spin" /> : <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />}
                        <span className="ml-2">Google</span>
                    </Button>
                    <Button variant="outline" type="button" onClick={handleGitHubSignIn} disabled={loading || googleLoading || githubLoading}>
                        {githubLoading ? <Loader2 className="animate-spin" /> : <Github className="h-5 w-5" />}
                        <span className="ml-2">GitHub</span>
                    </Button>
                </div>
              </form>

              <div className="text-muted-foreground mt-8 text-center text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
                  Sign up for free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address below and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
            <label htmlFor="reset-email" className="text-sm font-medium">Email</label>
            <Input 
                id="reset-email" 
                type="email" 
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
            />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handlePasswordReset} disabled={resetLoading}>
            {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
