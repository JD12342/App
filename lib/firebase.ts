import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from 'firebase/app';
import { getAuth as getWebAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

type ReactNativeAuthHelpers = {
  initializeAuth?: (app: FirebaseApp, deps?: Record<string, unknown>) => Auth;
  getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
  getAuth?: (app?: FirebaseApp) => Auth;
};

let initializeAuthWithPersistence: ((app: FirebaseApp, deps?: Record<string, unknown>) => Auth) | null = null;
let getReactNativePersistenceFn: ((storage: typeof AsyncStorage) => unknown) | null = null;
let getReactNativeAuth: ((app?: FirebaseApp) => Auth) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rnAuth = require('firebase/auth') as ReactNativeAuthHelpers;
  if (typeof rnAuth.initializeAuth === 'function') {
    initializeAuthWithPersistence = rnAuth.initializeAuth;
  }
  if (typeof rnAuth.getReactNativePersistence === 'function') {
    getReactNativePersistenceFn = rnAuth.getReactNativePersistence;
  }
  if (typeof rnAuth.getAuth === 'function') {
    getReactNativeAuth = rnAuth.getAuth;
  }
} catch (error) {
  console.warn(
    'Firebase React Native auth helpers are unavailable; falling back to generic auth instance.',
    error
  );
}

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

console.log('Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? '****' : undefined,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? '****' : undefined,
});

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (missingKeys.length) {
  console.error(
    `Firebase configuration is missing keys: ${missingKeys.join(', ')}. Falling back to guest mode.`
  );
} else {
  try {
    if (!getApps().length) {
      console.log('Initializing new Firebase app...');
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');

      if (initializeAuthWithPersistence && getReactNativePersistenceFn) {
        try {
          console.log('Initializing Firebase Auth with persistence...');
          auth = initializeAuthWithPersistence(app, {
            persistence: getReactNativePersistenceFn(AsyncStorage),
          });
          console.log('Firebase Auth initialized with persistence');
        } catch (error) {
          console.error(
            'Unable to enable React Native auth persistence; falling back to default auth instance.',
            error
          );
          auth = (getReactNativeAuth ?? getWebAuth)(app);
        }
      } else {
        console.log('Using default Firebase Auth...');
        auth = getWebAuth(app);
      }
    } else {
      console.log('Using existing Firebase app...');
      app = getApps()[0];
      auth = (getReactNativeAuth ?? getWebAuth)(app);
    }
    
    console.log('Initializing Firestore...');
    db = getFirestore(app);
    console.log('Firestore initialized successfully');
    
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export const isFirebaseConfigured = !!app;

export { app, auth, db };

