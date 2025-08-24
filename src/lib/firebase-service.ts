
'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { UserData, Portfolio, StoredActivity, OnboardingData, SurveySubmission } from './types';
import { initialPortfolioData } from './initial-data';
import type { SyllabusDay } from '@/ai/flows/generate-syllabus';

// --- User Data ---

export const createUserDocument = async (userId: string, email: string, name: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    const initialData: UserData = {
      ...initialPortfolioData,
      activity: [],
      subscription: {
        plan: 'free',
        status: 'inactive',
        endDate: null
      },
      onboardingCompleted: false,
      syllabus: [],
    };
    initialData.portfolio.personalInfo.email = email;
    initialData.portfolio.personalInfo.name = name;
    await setDoc(userRef, initialData);
  }
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  }
  return null;
};

export const updateUserOnboardingData = async (userId: string, onboardingData: OnboardingData, syllabus: SyllabusDay[]): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const updateData = {
        'portfolio.personalInfo.name': onboardingData.name,
        'portfolio.education': [{
            institution: onboardingData.university,
            degree: onboardingData.major,
            year: 'N/A'
        }],
        onboardingCompleted: true,
        syllabus: syllabus
    };
    await setDoc(userRef, updateData, { merge: true });
}

// --- Subscription ---

export const updateSubscription = async (userId: string, plan: 'monthly' | 'yearly'): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const currentDate = new Date();
  const endDate = new Date(currentDate);

  if (plan === 'monthly') {
    endDate.setMonth(currentDate.getMonth() + 1);
  } else if (plan === 'yearly') {
    endDate.setFullYear(currentDate.getFullYear() + 1);
  }

  const subscriptionData = {
    plan,
    status: 'active',
    startDate: currentDate.toISOString(),
    endDate: endDate.toISOString()
  };

  await setDoc(userRef, { subscription: subscriptionData }, { merge: true });
};


// --- Portfolio ---

export const getPortfolio = async (userId: string): Promise<Portfolio | null> => {
  const userData = await getUserData(userId);
  return userData?.portfolio ?? null;
};

export const updatePortfolio = async (userId: string, portfolio: Portfolio): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { portfolio }, { merge: true });
};

// --- Activity ---

export const getActivity = async (userId:string): Promise<StoredActivity[]> => {
  const userData = await getUserData(userId);
  return userData?.activity ?? [];
};

export const addActivity = async (userId: string, activity: StoredActivity): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  // Use setDoc with merge to create the document if it doesn't exist,
  // and to gracefully add to the activity array.
  await setDoc(userRef, {
    activity: arrayUnion(activity)
  }, { merge: true });
};

export const updateActivity = async (userId: string, updatedActivity: StoredActivity): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userData = await getUserData(userId);
    if (!userData) return;

    const activityIndex = userData.activity.findIndex(a => a.id === updatedActivity.id);
    
    if (activityIndex > -1) {
        const newActivityArray = [...userData.activity];
        newActivityArray[activityIndex] = updatedActivity;
        await updateDoc(userRef, { activity: newActivityArray });
    }
};

// --- Survey ---
export const saveSurveySubmission = async (submission: SurveySubmission): Promise<void> => {
    try {
        const submissionWithTimestamp = {
            ...submission,
            timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'surveySubmissions'), submissionWithTimestamp);
    } catch (error) {
        console.error("Error saving survey submission: ", error);
        throw error;
    }
}

