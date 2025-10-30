import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase expects web configuration even in Expo/React Native environments.
// Values are supplied via Expo public env vars to avoid hardcoding sensitive keys.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

type ReactNativeAuthModule = {
  initializeAuth: (app: FirebaseApp, deps?: Record<string, unknown>) => Auth;
  getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
};

let reactNativeAuthModule: ReactNativeAuthModule | null = null;

try {
  // Dynamically require the React Native specific auth helpers to avoid bundler
  // resolution issues when they're not present (e.g. web builds).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  reactNativeAuthModule = require('@firebase/auth/dist/rn/index.js');
} catch (error) {
  console.warn(
    'Firebase React Native auth helpers are unavailable; falling back to in-memory auth persistence.',
    error
  );
}

if (missingKeys.length) {
  console.warn(
    `Firebase configuration is missing keys: ${missingKeys.join(', ')}. Falling back to guest mode.`
  );
} else {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);

    if (reactNativeAuthModule?.initializeAuth && reactNativeAuthModule.getReactNativePersistence) {
      auth = reactNativeAuthModule.initializeAuth(app, {
        persistence: reactNativeAuthModule.getReactNativePersistence(AsyncStorage),
      });
    } else {
      auth = getAuth(app);
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
  }
  db = getFirestore(app);
}

export const isFirebaseConfigured = !!app;

export { app, auth, db };

