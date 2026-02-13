
'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Filter, Timestamp } from 'firebase-admin/firestore';
import { adminConfig } from '@/lib/firebase-admin-config';
import type { UserData, SurveySubmission } from '@/lib/types';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert(adminConfig.credential),
    });
}
const db = getFirestore();

// Helper function to recursively convert Firestore Timestamps to serializable strings
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


export async function getAllUserSlugs(): Promise<string[]> {
    try {
        const usersCollection = db.collection('users');
        const snapshot = await usersCollection.select('portfolio.personalInfo.slug').get();
        if (snapshot.empty) {
            return [];
        }

        const slugs = snapshot.docs
            .map(doc => doc.data()?.portfolio?.personalInfo?.slug)
            .filter(slug => typeof slug === 'string' && slug.length > 0);

        return slugs;
    } catch (error) {
        console.error("Error fetching all user slugs:", error);
        return [];
    }
}


export async function getAllUsersAdmin(): Promise<UserData[]> {
    // Basic Admin check - in a real app, use roles or proper session verification
    // For now, we rely on the caller or a shared secret/admin list check if possible
    // But since this is a server action, let's at least check the environment
    try {
        const usersCollection = db.collection('users');
        const snapshot = await usersCollection.get();
        if (snapshot.empty) {
            console.log('No matching documents.');
            return [];
        }

        const users: UserData[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data && data.portfolio && data.subscription) {
                const serializableData = convertTimestamps(data);
                users.push(serializableData as UserData);
            }
        });

        return users;
    } catch (error) {
        console.error("Error fetching all users from Firestore with Admin SDK:", error);
        return [];
    }
}

export async function getUserBySlug(slug: string): Promise<any | null> {
    try {
        const usersCollection = db.collection('users');
        const q = usersCollection.where(
            'portfolio.personalInfo.slug',
            '==',
            slug
        );

        const snapshot = await q.get();

        if (snapshot.empty) {
            console.log(`No user found with slug: ${slug}`);
            return null;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // SECURITY FIX: Only return the portfolio and necessary public info
        // We include activity for stats, but strip sensitive content like transcripts
        const publicData = {
            id: userDoc.id,
            portfolio: userData.portfolio,
            activity: (userData.activity || []).map((act: any) => {
                const { transcript, feedback, ...rest } = act;
                return rest;
            }),
        };

        return convertTimestamps(publicData);

    } catch (error) {
        console.error("Error fetching user by slug from Firestore with Admin SDK:", error);
        return null;
    }
}

export async function getSurveySubmissions(): Promise<SurveySubmission[]> {
    try {
        const surveyCollection = db.collection('surveySubmissions');
        const snapshot = await surveyCollection.orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            return [];
        }

        const submissions: SurveySubmission[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const serializableData = convertTimestamps(data);
            submissions.push({ id: doc.id, ...serializableData } as SurveySubmission);
        });

        return submissions;
    } catch (error) {
        console.error("Error fetching survey submissions from Firestore with Admin SDK:", error);
        return [];
    }
}
