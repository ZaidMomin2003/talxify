
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import type { SignUpForm, SignInForm } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { createUserDocument } from '@/lib/firebase-service';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (data: SignUpForm) => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: data.name });
    await createUserDocument(user.uid, user.email!, user.displayName!);
    setUser(user); // Manually update state to reflect displayName change
    return userCredential;
  };

  const signIn = async (data: SignInForm) => {
     return signInWithEmailAndPassword(auth, data.email, data.password);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await createUserDocument(user.uid, user.email!, user.displayName!);
    return result;
  };

  const signInWithGitHub = async () => {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    await createUserDocument(user.uid, user.email!, user.displayName!);
    return result;
  };

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
