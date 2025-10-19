

'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs, addDoc, serverTimestamp, runTransaction, deleteDoc, increment, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import type { UserData, Portfolio, StoredActivity, OnboardingData, SurveySubmission, IcebreakerData, TodoItem } from './types';
import { initialPortfolioData } from './initial-data';
import type { SyllabusDay } from '@/ai/flows/generate-syllabus';
import { format, differenceInHours } from 'date-fns';

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
        status: 'inactive',
        endDate: null
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
    return { id: docSnap.id, ...docSnap.data() } as UserData;
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

export const updateUserFromIcebreaker = async (userId: string, icebreakerData: IcebreakerData): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const updateData: { [key: string]: any } = {};

    if (icebreakerData.name) {
        updateData['portfolio.personalInfo.name'] = icebreakerData.name;
    }
    if (icebreakerData.city) {
        updateData['portfolio.personalInfo.address'] = icebreakerData.city;
    }
    if (icebreakerData.college) {
        updateData['portfolio.education'] = arrayUnion({
            institution: icebreakerData.college,
            degree: 'Degree',
            year: 'Year'
        });
    }
    if (icebreakerData.hobbies && icebreakerData.hobbies.length > 0) {
        // Filter out any potential undefined/null values from hobbies before mapping
        const validHobbies = icebreakerData.hobbies.filter(h => h).map(h => ({ name: h }));
        if (validHobbies.length > 0) {
             updateData['portfolio.hobbies'] = arrayUnion(...validHobbies);
        }
    }
    if (icebreakerData.skills && icebreakerData.skills.length > 0) {
        // Filter out any potential undefined/null values from skills before mapping
        const validSkills = icebreakerData.skills.filter(s => s).map(s => ({ skill: s, expertise: 50 }));
        if (validSkills.length > 0) {
            updateData['portfolio.skills'] = arrayUnion(...validSkills);
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

export const updateSubscription = async (userId: string, plan: 'pro-60d'): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const currentDate = new Date();
  const endDate = new Date(currentDate);

  if (plan === 'pro-60d') {
    endDate.setDate(currentDate.getDate() + 60);
  }

  const subscriptionData = {
    plan,
    status: 'active',
    startDate: currentDate.toISOString(),
    endDate: endDate.toISOString()
  };

  await setDoc(userRef, { subscription: subscriptionData }, { merge: true });
};

export const checkAndIncrementUsage = async (userId: string): Promise<{ success: boolean; message: string; }> => {
    // Temporarily disable usage limits
    return { success: true, message: "" };
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
            const { resumeExports } = userData.subscription;
            const today = format(new Date(), 'yyyy-MM-dd');
            
            const dailyLimit = 5;

            if (resumeExports && resumeExports.date === today) {
                if (resumeExports.count < dailyLimit) {
                    transaction.update(userRef, { 'subscription.resumeExports.count': resumeExports.count + 1 });
                    usageAllowed = true;
                } else {
                    usageAllowed = false;
                    message = `You have reached your daily limit of ${dailyLimit} resume exports. Please try again tomorrow.`;
                }
            } else {
                // First export of the day
                transaction.set(userRef, { subscription: { resumeExports: { date: today, count: 1 } } }, { merge: true });
                usageAllowed = true;
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
    return userDocData?.portfolio ?? null;
};


export const updatePortfolio = async (userId: string, portfolio: Partial<Portfolio>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
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
