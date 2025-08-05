// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "talxify-ijwhm",
  appId: "1:1001932177843:web:75f73b312b12bf58bc8bc6",
  storageBucket: "talxify-ijwhm.firebasestorage.app",
  apiKey: "AIzaSyD655B1QEZiJGUGTAOblJrLF1vS1BO62Gw",
  authDomain: "talxify-ijwhm.firebaseapp.com",
  messagingSenderId: "1001932177843",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
