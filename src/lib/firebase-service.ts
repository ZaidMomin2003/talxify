

'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs, addDoc, serverTimestamp, runTransaction, deleteDoc, increment, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { UserData, Portfolio, StoredActivity, OnboardingData, SurveySubmission, IcebreakerData, TodoItem, SubscriptionPlan, UsageType } from './types';
import { initialPortfolioData } from './initial-data';
import { format, differenceInHours, addMonths, addDays } from 'date-fns';
import { getUserBySlug } from '@/app/zaidmin/actions';


// Helper function to convert Firestore Timestamps to ISO strings
const convertTimestamps = (data: any): any => {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(item => convertTimestamps(item));
    }
    if (typeof data === 'object' && data !== null) {
        if (data instanceof Timestamp) {
            return data.toDate().toISOString();
        }
        const newData: { [key: string]: any } = {};
        for (const key in data) {
            newData[key] = convertTimestamps(data[key]);
        }
        return newData;
    }
    return data;
};


// --- User Data ---

export const createUserDocument = async (userId: string, email: string, name: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    const initialData: UserData = {
      ...initialPortfolioData,
      id: userId,
      activity: [],
      subscription: {
        plan: 'free',
        status: 'active', // Free plan is always active
        endDate: null,
        usage: {
            interview: 0,
            codingQuiz: 0,
            notes: 0,
            questionGenerator: 0,
            resumeExport: 0,
        }
      },
      onboardingCompleted: false,
      syllabus: [],
      retakeCounts: {},
      timestamp: serverTimestamp(),
      todos: [],
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
    const data = docSnap.data();
    const serializableData = convertTimestamps(data);
    return { id: docSnap.id, ...serializableData } as UserData;
  }
  return null;
};

export const updateUserOnboardingData = async (userId: string, onboardingData: OnboardingData): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const updateData = {
        'portfolio.personalInfo.name': onboardingData.name,
        'portfolio.education': [{
            institution: onboardingData.university,
            degree: onboardingData.major,
            year: 'N/A'
        }],
        onboardingCompleted: true,
        // Also save roles and companies for future use, even without a syllabus
        'onboardingInfo.roles': onboardingData.roles,
        'onboardingInfo.companies': onboardingData.companies,
    };
    await setDoc(userRef, updateData, { merge: true });
}

export const updateUserFromIcebreaker = async (userId: string, icebreakerData: IcebreakerData): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userData = await getUserData(userId);
    if (!userData) return;

    const updateData: { [key: string]: any } = {};

    if (icebreakerData.name) {
        updateData['portfolio.personalInfo.name'] = icebreakerData.name;
    }
    if (icebreakerData.city) {
        updateData['portfolio.personalInfo.address'] = icebreakerData.city;
    }
    if (icebreakerData.college && !userData.portfolio.education.some(e => e.institution === icebreakerData.college)) {
        updateData['portfolio.education'] = arrayUnion({
            institution: icebreakerData.college,
            degree: 'Degree',
            year: 'Year'
        });
    }
    if (icebreakerData.hobbies && icebreakerData.hobbies.length > 0) {
        const existingHobbies = new Set(userData.portfolio.hobbies.map(h => h.name));
        const newHobbies = icebreakerData.hobbies.filter(h => h && !existingHobbies.has(h)).map(h => ({ name: h }));
        if (newHobbies.length > 0) {
            updateData['portfolio.hobbies'] = arrayUnion(...newHobbies);
        }
    }
    if (icebreakerData.skills && icebreakerData.skills.length > 0) {
        const existingSkills = new Set(userData.portfolio.skills.map(s => s.skill));
        const newSkills = icebreakerData.skills.filter(s => s && !existingSkills.has(s)).map(s => ({ skill: s, expertise: 50 }));
        if (newSkills.length > 0) {
            updateData['portfolio.skills'] = arrayUnion(...newSkills);
        }
    }
    
    if (Object.keys(updateData).length > 0) {
        await updateDoc(userRef, updateData);
    }
}


export const deleteUserDocument = async (userId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
};


// --- Subscription & Usage ---

export const updateSubscription = async (userId: string, planId: SubscriptionPlan): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const currentDate = new Date();
  
  let monthsToAdd = 0;
  let interviewLimit = 0;

  if (planId === 'pro-1m') {
    monthsToAdd = 1;
    interviewLimit = 10;
  } else if (planId === 'pro-2m') {
    monthsToAdd = 2;
    interviewLimit = 25;
  } else if (planId === 'pro-3m') {
    monthsToAdd = 3;
    interviewLimit = 40;
  }

  if (monthsToAdd === 0) {
      throw new Error("Invalid plan ID provided for subscription update.");
  }

  const endDate = addMonths(currentDate, monthsToAdd);

  const subscriptionData = {
    plan: planId,
    status: 'active',
    startDate: currentDate.toISOString(),
    endDate: endDate.toISOString(),
    interviewUsage: {
        limit: interviewLimit,
        count: 0
    },
    // Reset free tier usage on upgrade
    usage: {},
  };

  await setDoc(userRef, { 
      subscription: subscriptionData,
      // Reset monthly resume exports on new subscription
      'subscription.resumeExports': { date: format(new Date(), 'yyyy-MM'), count: 0 },
    }, { merge: true });
};

export const checkAndIncrementUsage = async (userId: string, usageType: UsageType): Promise<{ success: boolean; message: string; }> => {
    const userRef = doc(db, 'users', userId);

    try {
        let usageAllowed = false;
        let message = '';
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User document does not exist!");
            }

            const userData = userDoc.data() as UserData;
            const isPro = userData.subscription?.plan?.startsWith('pro') && userData.subscription.endDate && new Date(userData.subscription.endDate) > new Date();
            
            // Pro Plan Logic
            if (isPro) {
                if (usageType === 'interview') {
                     const interviewUsage = userData.subscription?.interviewUsage || { count: 0, limit: 10 };
                     if (interviewUsage.count < interviewUsage.limit) {
                         transaction.update(userRef, { 'subscription.interviewUsage.count': increment(1) });
                         usageAllowed = true;
                     } else {
                         usageAllowed = false;
                         message = `You have reached your limit of ${interviewUsage.limit} AI interviews for this plan.`;
                     }
                } else {
                    // All other usage types are unlimited for Pro users
                    usageAllowed = true;
                }
                return;
            }
            
            // Free Plan Logic
            const freeLimits: Record<UsageType, number> = {
                interview: 1,
                codingQuiz: 1,
                notes: 1,
                questionGenerator: 1,
                resumeExport: 1,
                aiEnhancement: 1,
            };

            const currentUsage = userData.subscription?.usage?.[usageType] || 0;

            if (currentUsage < freeLimits[usageType]) {
                transaction.set(userRef, { subscription: { usage: { [usageType]: increment(1) } } }, { merge: true });
                usageAllowed = true;
            } else {
                usageAllowed = false;
                const featureName = usageType.replace(/([A-Z])/g, ' $1').toLowerCase();
                message = `You have used your free ${featureName}. Upgrade to Pro for unlimited access.`;
            }
        });
        
        return { success: usageAllowed, message };

    } catch (e) {
        console.error(`${usageType} usage transaction failed: `, e);
        return { success: false, message: `An error occurred while checking your usage limit. Please try again.` };
    }
}


export const checkAndIncrementResumeExports = async (userId: string): Promise<{ success: boolean; message: string; }> => {
    const userRef = doc(db, 'users', userId);

    try {
        let usageAllowed = false;
        let message = '';
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User document does not exist!");
            }

            const userData = userDoc.data() as UserData;
            const isPro = userData.subscription?.plan?.startsWith('pro') && userData.subscription.endDate && new Date(userData.subscription.endDate) > new Date();
            
            if (isPro) {
                // Pro plan: 10 exports per month
                const limit = 10;
                const usageData = userData.subscription?.resumeExports;
                const currentPeriod = format(new Date(), 'yyyy-MM');

                if (usageData && usageData.date === currentPeriod) {
                    if (usageData.count < limit) {
                        transaction.update(userRef, { 'subscription.resumeExports.count': increment(1) });
                        usageAllowed = true;
                    } else {
                        usageAllowed = false;
                        message = `You have reached your monthly limit of ${limit} resume exports.`;
                    }
                } else {
                    transaction.set(userRef, { subscription: { resumeExports: { date: currentPeriod, count: 1 } } }, { merge: true });
                    usageAllowed = true;
                }
            } else {
                // Free plan: 1 lifetime export
                const limit = 1;
                const usageData = userData.subscription?.usage?.resumeExport || 0;
                if (usageData < limit) {
                    transaction.set(userRef, { subscription: { usage: { resumeExport: increment(1) } } }, { merge: true });
                    usageAllowed = true;
                } else {
                    usageAllowed = false;
                    message = 'You have used your 1 free resume export. Upgrade to Pro for more.';
                }
            }
        });
        
        return { success: usageAllowed, message };

    } catch (e) {
        console.error("Resume export transaction failed: ", e);
        return { success: false, message: "An error occurred while checking your export limit. Please try again." };
    }
}


// --- Portfolio ---

export const getPortfolio = async (userId: string): Promise<Portfolio | null> => {
    const userDocData = await getUserData(userId);
    const portfolio = userDocData?.portfolio ?? null;

    if (portfolio && userDocData) {
        const isPro = userDocData.subscription?.plan?.startsWith('pro') && userDocData.subscription.endDate && new Date(userDocData.subscription.endDate) > new Date();
        const isFreeTrial = userDocData.subscription?.plan === 'free' && userDocData.subscription.startDate && differenceInHours(new Date(), new Date(userDocData.subscription.startDate)) <= 24;
        if (!isPro && !isFreeTrial) {
            portfolio.personalInfo.name += " (Preview)";
        }
    }
    return portfolio;
};


export const updatePortfolio = async (userId: string, portfolio: Partial<Portfolio>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  if (portfolio.personalInfo?.slug) {
      try {
          const existingUser = await getUserBySlug(portfolio.personalInfo.slug);
          if (existingUser && existingUser.id !== userId) {
              throw new Error("This portfolio URL is already taken. Please choose another.");
          }
      } catch (error) {
          // If getUserBySlug fails (e.g., server action issue), log it but don't block the save.
          // This prevents a server-side failure from blocking a client-side action.
          console.error("Could not verify slug uniqueness:", error);
      }
  }
  await setDoc(userRef, { portfolio }, { merge: true });
};

// --- Activity & Retakes ---

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

export const incrementRetakeCount = async (userId: string, topic: string) => {
    const userRef = doc(db, 'users', userId);
    // Use dot notation to increment a specific field in a map
    const fieldPath = `retakeCounts.${topic}`;
    await updateDoc(userRef, {
        [fieldPath]: increment(1)
    });
};

export const getRetakeCount = async (userId: string, topic: string): Promise<number> => {
    const userData = await getUserData(userId);
    return userData?.retakeCounts?.[topic] || 0;
};


// --- To-Do List ---
export const addTodo = async (userId: string, taskText: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }
            const userData = userDoc.data();
            const currentTodos = userData.todos || [];

            const newTodo: TodoItem = {
                id: doc(collection(db, 'temp')).id, // Firestore-like offline ID generation
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString(), // Use client-side timestamp for immediate consistency
            };

            const newTodosArray = [...currentTodos, newTodo];
            transaction.update(userRef, { todos: newTodosArray });
        });
    } catch (e) {
        console.error("Add to-do transaction failed: ", e);
        // If the transaction fails, it might be because the 'todos' field doesn't exist.
        // As a fallback, we can try to create it with setDoc and merge.
        const newTodo: TodoItem = {
            id: doc(collection(db, 'temp')).id,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, { todos: arrayUnion(newTodo) }, { merge: true });
    }
};

export const updateTodo = async (userId: string, todoId: string, updates: Partial<Omit<TodoItem, 'id'>>): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userData = await getUserData(userId);
    if (!userData || !userData.todos) return;

    const todoIndex = userData.todos.findIndex(t => t.id === todoId);
    if (todoIndex > -1) {
        const newTodos = [...userData.todos];
        newTodos[todoIndex] = { ...newTodos[todoIndex], ...updates };
        await updateDoc(userRef, { todos: newTodos });
    }
};

export const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userData = await getUserData(userId);
    if (!userData || !userData.todos) return;

    const todoToDelete = userData.todos.find(t => t.id === todoId);
    if (todoToDelete) {
        await updateDoc(userRef, {
            todos: arrayRemove(todoToDelete)
        });
    }
};


// --- Survey ---
export const saveSurveySubmission = async (submission: Partial<SurveySubmission>): Promise<void> => {
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
};

// --- Waitlist ---
export const saveWaitlistSubmission = async (submission: {name: string, email: string}): Promise<void> => {
    try {
        const submissionWithTimestamp = {
            ...submission,
            timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'waitlist'), submissionWithTimestamp);
    } catch (error) {
        console.error("Error saving waitlist submission: ", error);
        throw error;
    }
}

    
