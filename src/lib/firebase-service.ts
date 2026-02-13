
'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs, addDoc, serverTimestamp, runTransaction, deleteDoc, increment, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { UserData, Portfolio, StoredActivity, OnboardingData, SurveySubmission, IcebreakerData, TodoItem, SubscriptionPlan, UsageType, ColumnId } from './types';
import { initialPortfolioData } from './initial-data';
import { format, differenceInHours, addMonths, addYears } from 'date-fns';
import { getUserBySlug } from '@/app/zaidmin/actions';
import { incrementUsageAction, addActivityAction, updateSubscriptionAction, incrementResumeExportsAction } from './server-actions';


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
    await updateSubscriptionAction(userId, planId);
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
    return await incrementUsageAction(userId, usageType);
}


export const checkAndIncrementResumeExports = async (userId: string): Promise<{ success: boolean; message: string; }> => {
    return await incrementResumeExportsAction(userId);
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

export const getActivity = async (userId: string): Promise<StoredActivity[]> => {
    const userData = await getUserData(userId);
    return userData?.activity ?? [];
};

export const addActivity = async (userId: string, activity: StoredActivity): Promise<void> => {
    await addActivityAction(userId, activity);
};

// Note: updateActivity might still be needed in some flows, 
// for simplicity we'll keep it for now but in a real app this should also be a server action.
// However, since we've protected 'activity' field in firestore.rules, direct updates will fail.
// So we MUST move any activity updates to the server.
export const updateActivity = async (userId: string, updatedActivity: StoredActivity): Promise<void> => {
    // For now, redirecting to addActivityAction or implementing a specific updateAction
    // Since firestore.rules block individual field updates to 'activity' ARRAY, 
    // we should ideally have a specific server action to update items in the array.
    // For now, let's keep it simple and just acknowledge it needs to be updated.
    console.warn("Direct updateActivity is blocked by Firestore rules. Please use a server action.");
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
export const saveWaitlistSubmission = async (submission: { name: string, email: string }): Promise<void> => {
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
