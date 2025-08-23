
'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Filter } from 'firebase-admin/firestore';
import { adminConfig } from '@/lib/firebase-admin-config';
import type { UserData } from '@/lib/types';

// Initialize Firebase Admin SDK
if (!getApps().length) {  
  initializeApp({
    credential: cert(adminConfig.credential),
  });
}
const db = getFirestore();

export async function getAllUsersAdmin(): Promise<UserData[]> {
    try {
        const usersCollection = db.collection('users');
        const snapshot = await usersCollection.get();
        if (snapshot.empty) {
            console.log('No matching documents.');
            return [];
        }

        const users: UserData[] = [];
        snapshot.forEach(doc => {
            // A basic validation to ensure the document looks like a UserData object
             const data = doc.data();
            if (data && data.portfolio && data.subscription) {
                users.push(data as UserData);
            }
        });

        return users;
    } catch (error) {
        console.error("Error fetching all users from Firestore with Admin SDK:", error);
        // In a real app, you might want to throw the error or handle it differently
        return [];
    }
}

export async function getUserBySlug(slug: string): Promise<UserData | null> {
    try {
        const usersCollection = db.collection('users');
        // Use a where clause to directly query for the document with the matching slug.
        // This is much more efficient than fetching all documents.
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

        // Since slug should be unique, we expect at most one document.
        const userDoc = snapshot.docs[0];
        return userDoc.data() as UserData;

    } catch (error) {
        console.error("Error fetching user by slug from Firestore with Admin SDK:", error);
        return null;
    }
}

export async function getSurveySubmissions(): Promise<any[]> {
    try {
        const surveyCollection = db.collection('surveySubmissions');
        const snapshot = await surveyCollection.orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            return [];
        }

        const submissions: any[] = [];
        snapshot.forEach(doc => {
            submissions.push({ id: doc.id, ...doc.data() });
        });

        return submissions;
    } catch (error) {
        console.error("Error fetching survey submissions from Firestore with Admin SDK:", error);
        return [];
    }
}
