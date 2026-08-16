import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// All values come from environment variables — never hardcode Firebase
// config in source. Vite only exposes vars prefixed with VITE_ to the
// client bundle. Firebase's client config is not a secret in the way an
// API key normally is (it's safe to ship in a browser bundle — access is
// actually controlled by Firestore Security Rules, not by hiding this
// config), but we still keep it out of source control via .env.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

// Only initialize Firebase when config is actually present. Calling
// initializeApp() with undefined values can throw during module load —
// before Firebase is set up, that would crash the entire app on startup
// (a blank white page) rather than degrading gracefully to "accounts not
// configured yet," which is what AuthScreen is designed to show instead.
let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
}

export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;
