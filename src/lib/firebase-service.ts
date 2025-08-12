
'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import type { UserData, Portfolio, StoredActivity } from './types';
import { initialPortfolioData } from './initial-data';

// --- User Data ---

export const createUserDocument = async (userId: string, email: string, name: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    const initialData: UserData = {
      ...initialPortfolioData,
      activity: [],
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

export const getActivity = async (userId: string): Promise<StoredActivity[]> => {
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
