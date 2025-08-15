'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { adminConfig } from '@/lib/firebase-admin-config';
import type { UserData } from '@/lib/types';

// Initialize Firebase Admin SDK
if (!getApps().length) {  
  initializeApp(adminConfig);
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
