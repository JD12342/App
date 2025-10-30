import { auth, isFirebaseConfigured } from './firebase';

export const checkFirebaseConnection = async (): Promise<{
  isConnected: boolean;
  error?: string;
}> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        isConnected: false,
        error: 'Firebase is not configured. Running in guest mode.',
      };
    }

    // Try to get the current auth state
    const currentUser = auth.currentUser;
    console.log('Firebase connection check - Current user:', currentUser?.email || 'Not signed in');
    
    // Firebase is initialized and accessible
    return { isConnected: true };
  } catch (error) {
    console.error('Firebase connection error:', error);
    return { 
      isConnected: false, 
      error: error instanceof Error ? error.message : 'Unknown Firebase error' 
    };
  }
};

export const getFirebaseErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  const errorCode = error.code || '';
  const errorMessage = error.message || '';
  
  // Common Firebase Auth error codes with user-friendly messages
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address. Please check your email or create a new account.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/internal-error': 'Internal error. Please try again.',
  };
  
  // Check if we have a specific message for this error code
  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }
  
  // If no specific message, return a cleaned up version of the error
  if (errorMessage.includes('Firebase:')) {
    return errorMessage.split('Firebase: ')[1] || errorMessage;
  }
  
  return errorMessage || 'An unexpected error occurred. Please try again.';
};
