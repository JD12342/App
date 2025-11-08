import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, onSnapshot } from 'firebase/firestore';
import { Garden, Harvest } from '../types/types';
import { authService } from './auth';
import { db } from './firebase';
import { firebaseDB } from './firestore';
import { localDataService } from './localDataService';

// Check if user is in guest mode
const isGuestMode = async (): Promise<boolean> => {
  try {
    const guestMode = await AsyncStorage.getItem('@GardenTracker:guestMode');
    return guestMode === 'true';
  } catch (error) {
    console.error('Error checking guest mode:', error);
    return false;
  }
};

// Get the appropriate data service based on auth state
const getDataService = async () => {
  const user = await authService.getCurrentUser();
  const isGuest = await isGuestMode();
  
  // If authenticated user and not in guest mode, use Firebase
  if (user && !isGuest) {
    console.log('Using Firebase service for user:', user.uid);
    // Return an adapter that wraps firebaseDB with the correct interface
    return createFirebaseAdapter(user.uid);
  }
  
  // Otherwise use local storage
  console.log('Using local storage service');
  return localDataService;
};

// Adapter to convert firebaseDB interface to match localDataService interface
const createFirebaseAdapter = (userId: string) => ({
  async getGardens(): Promise<Garden[]> {
    return firebaseDB.gardens.getAll(userId);
  },

  async getGarden(id: string): Promise<Garden | null> {
    return firebaseDB.gardens.getById(userId, id);
  },

  async createGarden(garden: Omit<Garden, 'id' | 'createdAt' | 'updatedAt'> | Garden): Promise<Garden> {
    const now = Date.now();
    const fullGarden: Garden = {
      id: (garden as any).id || `garden_${Date.now()}`,
      name: (garden as any).name,
      location: (garden as any).location,
      createdAt: (garden as any).createdAt || now,
      updatedAt: (garden as any).updatedAt || now,
    };
    await firebaseDB.gardens.save(userId, fullGarden);
    return fullGarden;
  },

  async updateGarden(id: string, updates: Partial<Garden>): Promise<Garden> {
    const existing = await firebaseDB.gardens.getById(userId, id);
    if (!existing) throw new Error('Garden not found');
    const updated = { ...existing, ...updates, updatedAt: Date.now() };
    await firebaseDB.gardens.save(userId, updated);
    return updated;
  },

  async deleteGarden(id: string): Promise<void> {
    return firebaseDB.gardens.delete(userId, id);
  },

  async getHarvests(gardenId?: string): Promise<Harvest[]> {
    const all = await firebaseDB.harvests.getAll(userId);
    if (gardenId) {
      return all.filter(h => h.gardenId === gardenId);
    }
    return all;
  },

  async getHarvest(id: string): Promise<Harvest | null> {
    return firebaseDB.harvests.getById(userId, id);
  },

  async createHarvest(harvest: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'> | Harvest): Promise<Harvest> {
    const now = Date.now();
    const fullHarvest: Harvest = {
      id: (harvest as any).id || `harvest_${Date.now()}`,
      gardenId: (harvest as any).gardenId,
      plantName: (harvest as any).plantName,
      quantity: (harvest as any).quantity,
      unit: (harvest as any).unit,
      date: (harvest as any).date,
      notes: (harvest as any).notes,
      photoUrl: (harvest as any).photoUrl,
      createdAt: (harvest as any).createdAt || now,
      updatedAt: (harvest as any).updatedAt || now,
    };
    await firebaseDB.harvests.save(userId, fullHarvest);
    return fullHarvest;
  },

  async updateHarvest(id: string, updates: Partial<Harvest>): Promise<Harvest> {
    const existing = await firebaseDB.harvests.getById(userId, id);
    if (!existing) throw new Error('Harvest not found');
    const updated = { ...existing, ...updates, updatedAt: Date.now() };
    await firebaseDB.harvests.save(userId, updated);
    return updated;
  },

  async deleteHarvest(id: string): Promise<void> {
    return firebaseDB.harvests.delete(userId, id);
  },

  // Add real-time listeners
  subscribeToGardens(onUpdate: (gardens: Garden[]) => void) {
    return firebaseDB.gardens.subscribe(userId, onUpdate);
  },

  subscribeToHarvests(onUpdate: (harvests: Harvest[]) => void) {
    return firebaseDB.harvests.getAll(userId).then(() => {
      // For harvests, subscribe to all by querying and listening
      const harvestsRef = collection(db!, `users/${userId}/harvests`);
      return onSnapshot(harvestsRef, (snapshot) => {
        const harvests = snapshot.docs.map(doc => ({
          id: doc.id,
          gardenId: doc.data().gardenId,
          plantName: doc.data().plantName,
          quantity: doc.data().quantity,
          unit: doc.data().unit,
          date: doc.data().date,
          notes: doc.data().notes,
          photoUrl: doc.data().photoUrl,
          createdAt: doc.data().createdAt,
          updatedAt: doc.data().updatedAt,
        }));
        onUpdate(harvests);
      });
    });
  },
});

/**
 * Unified Data Service - Handles both Firebase and local storage
 * Automatically switches based on authentication state
 */
export const dataService = {
  // Garden methods
  async getGardens(): Promise<Garden[]> {
    try {
      const service = await getDataService();
      return await service.getGardens();
    } catch (error) {
      console.error('Error getting gardens:', error);
      return [];
    }
  },

  async getGarden(id: string): Promise<Garden | null> {
    try {
      const service = await getDataService();
      return await service.getGarden(id);
    } catch (error) {
      console.error('Error getting garden:', error);
      return null;
    }
  },

  async createGarden(garden: Omit<Garden, 'id' | 'createdAt' | 'updatedAt'> | Garden): Promise<Garden> {
    try {
      const service = await getDataService();
      return await service.createGarden(garden);
    } catch (error) {
      console.error('Error creating garden:', error);
      throw error;
    }
  },

  async updateGarden(id: string, updates: Partial<Garden>): Promise<Garden> {
    try {
      const service = await getDataService();
      return await service.updateGarden(id, updates);
    } catch (error) {
      console.error('Error updating garden:', error);
      throw error;
    }
  },

  async deleteGarden(id: string): Promise<void> {
    try {
      const service = await getDataService();
      await service.deleteGarden(id);
    } catch (error) {
      console.error('Error deleting garden:', error);
      throw error;
    }
  },

  // Harvest methods
  async getHarvests(gardenId?: string): Promise<Harvest[]> {
    try {
      const service = await getDataService();
      return await service.getHarvests(gardenId);
    } catch (error) {
      console.error('Error getting harvests:', error);
      return [];
    }
  },

  async getHarvest(id: string): Promise<Harvest | null> {
    try {
      const service = await getDataService();
      return await service.getHarvest(id);
    } catch (error) {
      console.error('Error getting harvest:', error);
      return null;
    }
  },

  async createHarvest(harvest: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'> | Harvest): Promise<Harvest> {
    try {
      const service = await getDataService();
      return await service.createHarvest(harvest);
    } catch (error) {
      console.error('Error creating harvest:', error);
      throw error;
    }
  },

  async updateHarvest(id: string, updates: Partial<Harvest>): Promise<Harvest> {
    try {
      const service = await getDataService();
      return await service.updateHarvest(id, updates);
    } catch (error) {
      console.error('Error updating harvest:', error);
      throw error;
    }
  },

  async deleteHarvest(id: string): Promise<void> {
    try {
      const service = await getDataService();
      await service.deleteHarvest(id);
    } catch (error) {
      console.error('Error deleting harvest:', error);
      throw error;
    }
  },

  // Utility methods
  async isUsingLocalStorage(): Promise<boolean> {
    return await isGuestMode();
  },

  async exportData(): Promise<string> {
    const isGuest = await isGuestMode();
    
    if (isGuest) {
      return await localDataService.exportData();
    } else {
      // For Firebase users, we'd need to implement export functionality
      throw new Error('Export not available for Firebase users yet');
    }
  },

  async clearAllData(): Promise<void> {
    const isGuest = await isGuestMode();
    
    if (isGuest) {
      await localDataService.clearAllData();
    } else {
      throw new Error('Cannot clear Firebase data from client');
    }
  },
};
