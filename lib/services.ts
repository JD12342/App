import dataService from './dataService';

// Global initialization state
let isInitialized = false;
let globalCleanup: (() => void) | null = null;

/**
 * Initialize all app services
 * Call this function when the app starts
 */
export const initServices = async (): Promise<() => void> => {
  // Prevent multiple initializations
  if (isInitialized) {
    console.log('App services already initialized');
    return globalCleanup || (() => {});
  }

  try {
    console.log('Initializing app services...');
    
    // Initialize data service (returns cleanup function)
    const cleanupDataService = await dataService.initialize();
    console.log('Data service initialized');
    
    isInitialized = true;
    
    globalCleanup = () => {
      // Cleanup function to be called when app is unmounted
      if (isInitialized) {
        cleanupDataService();
        isInitialized = false;
        globalCleanup = null;
        console.log('App services cleaned up');
      }
    };
    
    return globalCleanup;
  } catch (error) {
    console.error('Error initializing app services:', error);
    isInitialized = false;
    // Return empty cleanup function in case of error
    return () => {};
  }
};
