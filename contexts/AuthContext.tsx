import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authLib from '../lib/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { localDataService } from '../lib/localDataService';

// Get the auth service from the auth module
const authService = authLib.authService;

// Constants for AsyncStorage
const USER_STORAGE_KEY = '@GardenTracker:user';
const GUEST_MODE_KEY = '@GardenTracker:guestMode';

// Type definitions
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterAsGuest: () => Promise<void>;
}

// Create the Auth Context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isGuest: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  enterAsGuest: async () => {},
});

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Load user from AsyncStorage on app start
  useEffect(() => {
    let mounted = true;
  const firebaseAuth = auth;
  const firebaseAvailable = isFirebaseConfigured && !!firebaseAuth;
    
    const loadUserFromStorage = async () => {
      try {
        // Check if user is in guest mode
        const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
        if (guestMode === 'true' && mounted) {
          setIsGuest(true);
          setUser(null);
          setIsLoading(false);
          return;
        }

        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser && mounted) {
          setUser(JSON.parse(storedUser));
          setIsGuest(false);
          // Set loading to false immediately after loading from storage
          setIsLoading(false);
        } else if (mounted) {
          // No stored user and not in guest mode - stay unauthenticated
          console.log('No authenticated user found, staying on sign-in page');
          setIsGuest(false);
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Set a faster timeout to prevent long loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth loading completed - proceeding with current state');
        setIsLoading(false);
      }
    }, 2000); // Reduced to 2 second timeout
    
    // Optimized Firebase auth state listener with better throttling
    let lastAuthChange = 0;
    const AUTH_THROTTLE_MS = 500; // Reduced throttle time for faster response
    
    const unsubscribe = firebaseAvailable && firebaseAuth
      ? firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (!mounted) return;
      
      try {
        // Check if we're in guest mode - if so, ignore Firebase auth state
        const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
        if (guestMode === 'true') {
          // We're in guest mode, don't update user state based on Firebase
          return;
        }
        
        const now = Date.now();
        if (now - lastAuthChange < AUTH_THROTTLE_MS) {
          // Throttle rapid auth state changes
          return;
        }
        
        lastAuthChange = now;
        
        if (firebaseUser) {
          // Only update AsyncStorage if user is different
          const storedUserStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
          const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
          
          if (!storedUser || storedUser.uid !== firebaseUser.uid) {
            // Store minimal user data instead of full object
            const minimalUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            };
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(minimalUser));
          }
          
          setUser(firebaseUser);
          setIsGuest(false);
        } else {
          // User signed out
          setUser(null);
          setIsGuest(false);
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth state change error:', error);
        setIsLoading(false);
      }
    })
      : () => {};
    
    if (!firebaseAvailable && mounted) {
      // When Firebase is unavailable, stay unauthenticated instead of forcing guest mode
      console.log('Firebase unavailable, staying on sign-in page');
      setIsGuest(false);
      setUser(null);
      setIsLoading(false);
    }
    
    // Load from storage immediately
    loadUserFromStorage();
    
    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-running

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.signIn(email, password);
      
      // Check if we were in guest mode - if so, sync data and photos
      const wasGuest = await AsyncStorage.getItem(GUEST_MODE_KEY);
      if (wasGuest === 'true') {
        console.log('Migrating data from guest mode to authenticated account...');
        
        try {
          // Import the photo sync functionality
          const { syncPendingPhotos } = require('../lib/photoSync');
          
          // Sync any pending photos to Firebase Storage
          console.log('Syncing pending photos to Firebase Storage...');
          await syncPendingPhotos();
        } catch (syncError) {
          console.error('Error syncing photos:', syncError);
          // Continue with sign in even if photo sync fails
        }
      }
      
      // Clear guest mode and update user state
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setIsGuest(false);
      setUser(user);
      // Store in AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      console.log("Sign in successful:", user.email);
    } catch (error) {
      console.error('Sign in error:', error);
      // Clear any stored user data on sign in failure
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setUser(null);
      setIsGuest(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.signUp(email, password);
      // Clear guest mode and update user state
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setIsGuest(false);
      setUser(user);
      // Store in AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      console.log("Sign up successful:", user.email);
    } catch (error) {
      console.error('Sign up error:', error);
      // Clear any stored user data on sign up failure
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setUser(null);
      setIsGuest(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (!isGuest) {
        await authService.signOut();
      }
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      await localDataService.clearAllData();
      setUser(null);
      setIsGuest(false);
      console.log("Sign out successful");
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const enterAsGuest = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setIsGuest(true);
      setUser(null);
      console.log("Entered as guest - data will be stored locally only");
    } catch (error) {
      console.error('Guest mode error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest,
        signIn,
        signUp,
        signOut,
        enterAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
export const useAuth = () => useContext(AuthContext);
