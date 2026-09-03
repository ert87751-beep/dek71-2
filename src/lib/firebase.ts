import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Firebase project configuration for dek71
const firebaseConfig = {
  projectId: firebaseConfigData.projectId || 'dek71-e6f93',
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID if available
let dbInstance: Firestore;
try {
  if (firebaseConfigData.firestoreDatabaseId) {
    dbInstance = getFirestore(app, firebaseConfigData.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch (error) {
  console.warn('Firestore custom DB init fallback to default:', error);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export default app;
