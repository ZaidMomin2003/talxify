
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD655B1QEZiJGUGTAOblJrLF1vS1BO62Gw",
  authDomain: "talxify-ijwhm.firebaseapp.com",
  projectId: "talxify-ijwhm",
  storageBucket: "talxify-ijwhm.firebasestorage.app",
  messagingSenderId: "1001932177843",
  appId: "1:1001932177843:web:a51b32056c25a308bc8bc6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, googleProvider, githubProvider };
