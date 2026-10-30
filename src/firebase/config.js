import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Storage key for client-configured Firebase credentials
const STORAGE_KEY = "campus_lost_found_firebase_config";

export function getStoredFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse stored Firebase config:", e);
  }

  // Fallback to Vite environment variables if available
  if (import.meta.env?.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  return null;
}

export function saveStoredFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

let appInstance = null;
let authInstance = null;
let dbInstance = null;
let isConfiguredState = false;

export function initializeFirebaseServices() {
  const config = getStoredFirebaseConfig();

  if (config && config.apiKey && config.projectId) {
    try {
      appInstance = !getApps().length ? initializeApp(config) : getApp();
      authInstance = getAuth(appInstance);
      dbInstance = getFirestore(appInstance);
      isConfiguredState = true;
      console.log("Firebase initialized successfully with Project ID:", config.projectId);
      return { app: appInstance, auth: authInstance, db: dbInstance, isConfigured: true };
    } catch (err) {
      console.warn("Firebase initialization error, running in Cloud Sandbox Mode:", err);
      isConfiguredState = false;
    }
  } else {
    console.info("Running in Campus Cloud Sandbox Mode (Local Firestore simulated). Configure your Firebase keys in Settings anytime.");
    isConfiguredState = false;
  }

  return { app: null, auth: null, db: null, storage: null, isConfigured: false };
}

// Initial setup
const { app, auth, db, isConfigured } = initializeFirebaseServices();

export { app, auth, db };
export const isFirebaseConfigured = () => isConfiguredState;
