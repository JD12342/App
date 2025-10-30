import NetInfo from '@react-native-community/netinfo';
import { User } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

// Import our services
import database from './database';
import { firebaseDB } from './firestore';

// Interface for synchronization service
export interface SyncService {
  syncNow: () => Promise<void>;
  isOnline: () => Promise<boolean>;
  startAutoSync: (intervalMs?: number) => void;
  stopAutoSync: () => void;
}

// Implementation of sync service
export const createSyncService = (getCurrentUser: () => Promise<User | null>): SyncService => {
  let syncInterval: ReturnType<typeof setInterval> | null = null;
  
  // Check if the device is online
  const isOnline = async (): Promise<boolean> => {
    try {
      const networkState = await NetInfo.fetch();
      return networkState.isConnected === true && networkState.isInternetReachable !== false;
    } catch (error) {
      console.error('Error checking network state:', error);
      return false;
    }
  };

  // Synchronize data with Firebase
  const syncNow = async (): Promise<void> => {
    try {
      // Check if online and user is authenticated
      const online = await isOnline();
      if (!online) {
        console.log('Device is offline, skipping sync');
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        console.log('User not authenticated, skipping sync');
        return;
      }

      const userId = user.uid;
      console.log('Starting sync for user:', userId);

      // Sync gardens
      await syncGardens(userId);
      
      // Sync harvests
      await syncHarvests(userId);
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  };

  // Sync gardens between local DB and Firebase
  const syncGardens = async (userId: string): Promise<void> => {
    try {
      // 1. Push local unsynced gardens to Firebase
      const unsyncedGardens = await database.gardens.getUnsynced();
      console.log(`Found ${unsyncedGardens.length} unsynced gardens to push`);
      
      for (const garden of unsyncedGardens) {
        if (garden.deleted === 1) {
          // Handle deleted gardens
          await firebaseDB.gardens.delete(userId, garden.id);
          await database.gardens.permanentlyDelete(garden.id);
        } else {
          // Handle new or updated gardens
          await firebaseDB.gardens.save(userId, garden);
          await database.gardens.markSynced(garden.id);
        }
      }
      
      // 2. Pull gardens from Firebase and update local
      const remoteGardens = await firebaseDB.gardens.getAll(userId);
      console.log(`Found ${remoteGardens.length} gardens in Firebase`);
      
      for (const garden of remoteGardens) {
        await database.gardens.saveFromFirebase(garden);
      }
    } catch (error) {
      console.error('Error syncing gardens:', error);
      throw error;
    }
  };

  // Sync harvests between local DB and Firebase
  const syncHarvests = async (userId: string): Promise<void> => {
    try {
      // 1. Push local unsynced harvests to Firebase
      const unsyncedHarvests = await database.harvests.getUnsynced();
      console.log(`Found ${unsyncedHarvests.length} unsynced harvests to push`);
      
      for (const harvest of unsyncedHarvests) {
        if (harvest.deleted === 1) {
          // Handle deleted harvests
          await firebaseDB.harvests.delete(userId, harvest.id);
          await database.harvests.permanentlyDelete(harvest.id);
        } else {
          // Handle new or updated harvests
          await firebaseDB.harvests.save(userId, harvest);
          await database.harvests.markSynced(harvest.id);
        }
      }
      
      // 2. Pull harvests from Firebase and update local
      const remoteHarvests = await firebaseDB.harvests.getAll(userId);
      console.log(`Found ${remoteHarvests.length} harvests in Firebase`);
      
      for (const harvest of remoteHarvests) {
        await database.harvests.saveFromFirebase(harvest);
      }
    } catch (error) {
      console.error('Error syncing harvests:', error);
      throw error;
    }
  };

  // Start automatic sync at regular intervals
  const startAutoSync = (intervalMs: number = 60000): void => {
    // Clear any existing interval
    if (syncInterval) {
      clearInterval(syncInterval);
    }
    
    // Set up new sync interval
    syncInterval = setInterval(async () => {
      try {
        await syncNow();
      } catch (error) {
        console.error('Auto sync error:', error);
      }
    }, intervalMs);
    
    console.log(`Auto sync started with interval of ${intervalMs}ms`);
  };

  // Stop automatic sync
  const stopAutoSync = (): void => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
      console.log('Auto sync stopped');
    }
  };

  return {
    syncNow,
    isOnline,
    startAutoSync,
    stopAutoSync,
  };
};

// Helper function to generate a unique ID for new records
export const generateId = (): string => {
  return uuidv4();
};
