
'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs, addDoc, serverTimestamp, runTransaction, deleteDoc, increment, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { UserData, Portfolio, StoredActivity, OnboardingData, SurveySubmission, IcebreakerData, TodoItem, SubscriptionPlan, UsageType, ColumnId } from './types';
import { initialPortfolioData } from './initial-data';
import { format, differenceInHours, addMonths, addYears } from 'date-fns';
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
            aiEnhancements: 0
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
  
  // Set a long expiration date to simulate a permanent Pro plan for now
  const endDate = addYears(currentDate, 5);

  const subscriptionData = {
    plan: planId,
    status: 'active',
    startDate: currentDate.toISOString(),
    endDate: endDate.toISOString(),
    usage: {},
  };

  await setDoc(userRef, { 
      subscription: subscriptionData,
      'subscription.resumeExports': { date: format(new Date(), 'yyyy-MM'), count: 0 },
    }, { merge: true });
};

const freePlanLimits: Record<UsageType, number> = {
    interview: 1,
    codingQuiz: 1,
    notes: 1,
    questionGenerator: 1,
    aiEnhancements: 2,
    resumeExport: 1
};


export const checkAndIncrementUsage = async (userId: string, usageType: UsageType): Promise<{ success: boolean; message: string; }> => {
    const userRef = doc(db, 'users', userId);

    try {
        const result = await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }
            
            const userData = userDoc.data() as UserData;
            const sub = userData.subscription;
            const plan = sub?.plan || 'free';

            // Pro users have unlimited access for these types
            if (plan.startsWith('pro') && (usageType !== 'interview' && usageType !== 'resumeExport')) {
                return { success: true, message: '' };
            }
            
            // Handle Pro plan interview usage
            if (plan.startsWith('pro') && usageType === 'interview') {
                const interviewUsage = sub.interviewUsage || { count: 0, limit: 0 };
                if (interviewUsage.count < interviewUsage.limit) {
                    transaction.update(userRef, { 'subscription.interviewUsage.count': increment(1) });
                    return { success: true, message: '' };
                } else {
                    return { success: false, message: 'You have reached your monthly interview limit for the Pro plan.' };
                }
            }

            // Handle Free plan usage
            const currentUsage = sub.usage?.[usageType] || 0;
            const limit = freePlanLimits[usageType];

            if (currentUsage < limit) {
                transaction.update(userRef, { [`subscription.usage.${usageType}`]: increment(1) });
                return { success: true, message: '' };
            } else {
                 return { success: false, message: `You have reached your limit of ${limit} for this feature on the free plan. Please upgrade to Pro for unlimited access.` };
            }
        });
        return result;
    } catch (e: any) {
        console.error("Usage check transaction failed: ", e);
        return { success: false, message: e.message || "An error occurred while checking usage." };
    }
}


export const checkAndIncrementResumeExports = async (userId: string): Promise<{ success: boolean; message: string; }> => {
    const userRef = doc(db, 'users', userId);
    
    try {
        const result = await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) { throw "User not found"; }

            const userData = userDoc.data() as UserData;
            const sub = userData.subscription;
            const plan = sub?.plan || 'free';

            if (plan.startsWith('pro')) {
                const currentMonth = format(new Date(), 'yyyy-MM');
                const resumeExports = sub.resumeExports || { date: currentMonth, count: 0 };
                
                // If it's a new month, reset the count
                if (resumeExports.date !== currentMonth) {
                    transaction.update(userRef, {
                        'subscription.resumeExports': { date: currentMonth, count: 1 }
                    });
                    return { success: true, message: '' };
                }

                if (resumeExports.count < 10) {
                    transaction.update(userRef, { 'subscription.resumeExports.count': increment(1) });
                    return { success: true, message: '' };
                } else {
                    return { success: false, message: 'You have reached your monthly limit of 10 resume exports for the Pro plan.' };
                }
            } else { // Free plan logic
                 const currentUsage = sub.usage?.resumeExport || 0;
                 if (currentUsage < freePlanLimits.resumeExport) {
                     transaction.update(userRef, { 'subscription.usage.resumeExport': increment(1) });
                     return { success: true, message: '' };
                 } else {
                     return { success: false, message: 'You have reached your limit for resume exports on the free plan. Please upgrade to Pro.' };
                 }
            }
        });
        return result;
    } catch (e: any) {
        console.error("Resume export check failed:", e);
        return { success: false, message: "An error occurred checking your resume export limit." };
    }
}


// --- Portfolio ---

export const getPortfolio = async (userId: string): Promise<Portfolio | null> => {
    const userDocData = await getUserData(userId);
    return userDocData?.portfolio ?? null;
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
export const addTodo = async (userId: string, taskText: string, columnId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const newTodo: TodoItem = {
        id: doc(collection(db, 'temp')).id, // Firestore-like offline ID generation
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        status: columnId as ColumnId,
    };
    await updateDoc(userRef, { todos: arrayUnion(newTodo) });
};

export const updateTodosBatch = async (userId: string, todos: TodoItem[]): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { todos: todos });
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
