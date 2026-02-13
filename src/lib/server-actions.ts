
'use server';

import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { adminConfig } from '@/lib/firebase-admin-config';
import type { UsageType, UserData, StoredActivity, SubscriptionPlan } from '@/lib/types';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert(adminConfig.credential),
    });
}
const db = getFirestore();

const freePlanLimits: Record<UsageType, number> = {
    interview: 1,
    codingQuiz: 1,
    notes: 1,
    questionGenerator: 1,
    aiEnhancements: 2,
    resumeExport: 1
};

/**
 * Server-side usage check and increment.
 * This prevents users from manipulating their own usage counters via the client SDK.
 */
export async function incrementUsageAction(userId: string, usageType: UsageType) {
    const userRef = db.collection('users').doc(userId);

    try {
        return await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                return { success: false, message: "User not found" };
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
                    transaction.update(userRef, { 'subscription.interviewUsage.count': FieldValue.increment(1) });
                    return { success: true, message: '' };
                } else {
                    return { success: false, message: 'You have reached your monthly interview limit for the Pro plan.' };
                }
            }

            // Handle Free plan usage
            const currentUsage = sub.usage?.[usageType] || 0;
            const limit = freePlanLimits[usageType];

            if (currentUsage < limit) {
                transaction.update(userRef, { [`subscription.usage.${usageType}`]: FieldValue.increment(1) });
                return { success: true, message: '' };
            } else {
                return { success: false, message: `You have reached your limit of ${limit} for this feature on the free plan.` };
            }
        });
    } catch (e: any) {
        console.error("Usage increment failed:", e);
        return { success: false, message: "An internal error occurred." };
    }
}

/**
 * Securely add activity from the server.
 */
export async function addActivityAction(userId: string, activity: StoredActivity) {
    const userRef = db.collection('users').doc(userId);
    try {
        await userRef.update({
            activity: FieldValue.arrayUnion(activity)
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to add activity:", e);
        return { success: false };
    }
}

/**
 * Securely update subscription (e.g. after payment or during onboarding).
 */
export async function updateSubscriptionAction(userId: string, planId: SubscriptionPlan) {
    const userRef = db.collection('users').doc(userId);
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(currentDate.getFullYear() + 5); // 5 year simulated pro

    const subscriptionData = {
        plan: planId,
        status: 'active',
        startDate: currentDate.toISOString(),
        endDate: endDate.toISOString(),
        usage: {},
        interviewUsage: planId.startsWith('pro') ? { limit: 10, count: 0 } : undefined,
    };

    try {
        await userRef.update({ subscription: subscriptionData });
        return { success: true };
    } catch (e) {
        console.error("Failed to update subscription:", e);
        return { success: false };
    }
}

/**
 * Securely check and increment resume exports.
 */
export async function incrementResumeExportsAction(userId: string) {
    const userRef = db.collection('users').doc(userId);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    try {
        return await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) return { success: false, message: "User not found" };

            const userData = userDoc.data() as UserData;
            const sub = userData.subscription;
            const plan = sub?.plan || 'free';

            if (plan.startsWith('pro')) {
                const resumeExports = sub.resumeExports || { date: currentMonth, count: 0 };

                if (resumeExports.date !== currentMonth) {
                    transaction.update(userRef, {
                        'subscription.resumeExports': { date: currentMonth, count: 1 }
                    });
                    return { success: true, message: '' };
                }

                if (resumeExports.count < 10) {
                    transaction.update(userRef, { 'subscription.resumeExports.count': FieldValue.increment(1) });
                    return { success: true, message: '' };
                } else {
                    return { success: false, message: 'You have reached your monthly limit of 10 resume exports for the Pro plan.' };
                }
            } else {
                const currentUsage = sub.usage?.resumeExport || 0;
                if (currentUsage < 1) { // Free limit
                    transaction.update(userRef, { 'subscription.usage.resumeExport': FieldValue.increment(1) });
                    return { success: true, message: '' };
                } else {
                    return { success: false, message: 'You have reached your limit for resume exports on the free plan.' };
                }
            }
        });
    } catch (e: any) {
        console.error("Resume export increment failed:", e);
        return { success: false, message: "Internal error." };
    }
}
