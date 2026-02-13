
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import type { SignUpForm, SignInForm } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { createUserDocument, getUserData } from '@/lib/firebase-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: SignUpForm) => Promise<any>;
  signIn: (data: SignInForm) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithGitHub: () => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        const userData = await getUserData(user.uid);
        // Only redirect to onboarding if it hasn't been completed and they aren't already there.
        if (userData && !userData.onboardingCompleted && !pathname.startsWith('/onboarding')) {
          router.push('/onboarding');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signUp = async (data: SignUpForm) => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: data.name });
    await createUserDocument(user.uid, user.email!, user.displayName!);
    // Refresh the user object to get the latest metadata like creationTime
    await user.reload(); 
    const refreshedUser = auth.currentUser;
    setUser(refreshedUser); // Manually update state to reflect displayName and metadata
    return userCredential;
  };

  const signIn = async (data: SignInForm) => {
     return signInWithEmailAndPassword(auth, data.email, data.password);
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    const authProvider = provider === 'google' ? googleProvider : githubProvider;
    const result = await signInWithPopup(auth, authProvider);
    const user = result.user;
    // Check if the user document already exists before creating a new one
    const existingUser = await getUserData(user.uid);
    if (!existingUser) {
        await createUserDocument(user.uid, user.email!, user.displayName!);
    }
    // Refresh the user object to get the latest metadata like creationTime
    await user.reload();
    const refreshedUser = auth.currentUser;
    setUser(refreshedUser);
    return result;
  }

  const signInWithGoogle = () => handleSocialSignIn('google');
  const signInWithGitHub = () => handleSocialSignIn('github');


  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signInWithGitHub, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
