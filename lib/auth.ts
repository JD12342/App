import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    User,
    UserCredential,
    type Auth
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

// Constants for AsyncStorage
const USER_STORAGE_KEY = '@GardenTracker:user';

// Interface for the authentication service
export interface AuthService {
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  subscribeToAuthChanges: (callback: (user: User | null) => void) => () => void;
}

// Store user in AsyncStorage for additional local persistence
const storeUserLocally = async (user: User | null) => {
  try {
    if (user) {
      // Store minimal user info to avoid large objects
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error storing user locally:', error);
  }
};

// Helper ensures Firebase auth is available before calling SDK methods
const ensureAuth = (): Auth => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      'Firebase is not configured. Copy .env.example to .env and provide your Firebase web credentials.'
    );
  }

  return auth;
};

// Authentication service implementation
export const authService: AuthService = {
  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const firebaseAuth = ensureAuth();
      const userCredential: UserCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await storeUserLocally(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  signUp: async (email: string, password: string): Promise<User> => {
    try {
      const firebaseAuth = ensureAuth();
      const userCredential: UserCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await storeUserLocally(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
      await storeUserLocally(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (isFirebaseConfigured && auth) {
      // First check Firebase Auth's current user
      const currentUser = auth.currentUser;
      if (currentUser) {
        return currentUser;
      }
    }

    // If no current user in Firebase Auth, check AsyncStorage
    try {
      const userDataStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (!userDataStr) {
        return null;
      }
      
      // We can't fully reconstruct a Firebase User from AsyncStorage
      // but we can return basic user info to help with UI rendering
      // while waiting for Firebase Auth to initialize
      return JSON.parse(userDataStr) as User;
    } catch (error) {
      console.error('Error getting current user from AsyncStorage:', error);
      return null;
    }
  },

  subscribeToAuthChanges: (callback: (user: User | null) => void): (() => void) => {
    if (!isFirebaseConfigured || !auth) {
      // Firebase unavailable, surface guest mode by emitting null once
      callback(null);
      return () => {};
    }

    return onAuthStateChanged(auth, async (user) => {
      // Update AsyncStorage when auth state changes
      await storeUserLocally(user);
      callback(user);
    });
  }
};
