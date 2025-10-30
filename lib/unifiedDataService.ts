import AsyncStorage from '@react-native-async-storage/async-storage';
import { Garden, Harvest } from '../types/types';
import { authService } from './auth';
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

/**
 * Unified Data Service - Handles both Firebase and local storage
 * Automatically switches based on authentication state
 */
export const dataService = {
  // Garden methods
  async getGardens(): Promise<Garden[]> {
    try {
      return await localDataService.getGardens();
    } catch (error) {
      console.error('Error getting gardens:', error);
      return [];
    }
  },

  async getGarden(id: string): Promise<Garden | null> {
    try {
      return await localDataService.getGarden(id);
    } catch (error) {
      console.error('Error getting garden:', error);
      return null;
    }
  },

  async createGarden(garden: Omit<Garden, 'id' | 'createdAt' | 'updatedAt'> | Garden): Promise<Garden> {
    try {
      const isGuest = await isGuestMode();
      
      if (!isGuest) {
        const user = await authService.getCurrentUser();
        if (!user) {
          console.log('No authenticated user detected, enabling guest mode for local persistence');
          await AsyncStorage.setItem('@GardenTracker:guestMode', 'true');
        }
      }

      return await localDataService.createGarden(garden);
    } catch (error) {
      console.error('Error creating garden:', error);
      throw error;
    }
  },

  async updateGarden(id: string, updates: Partial<Garden>): Promise<Garden> {
    try {
      const isGuest = await isGuestMode();

      if (!isGuest) {
        const user = await authService.getCurrentUser();
        if (!user) {
          console.log('No authenticated user detected, enabling guest mode for local persistence');
          await AsyncStorage.setItem('@GardenTracker:guestMode', 'true');
        }
      }

      return await localDataService.updateGarden(id, updates);
    } catch (error) {
      console.error('Error updating garden:', error);
      throw error;
    }
  },

  async deleteGarden(id: string): Promise<void> {
    try {
      const isGuest = await isGuestMode();

      if (!isGuest) {
        const user = await authService.getCurrentUser();
        if (!user) {
          console.log('No authenticated user detected, enabling guest mode for local persistence');
          await AsyncStorage.setItem('@GardenTracker:guestMode', 'true');
        }
      }

      await localDataService.deleteGarden(id);
    } catch (error) {
      console.error('Error deleting garden:', error);
      throw error;
    }
  },

  // Harvest methods
  async getHarvests(gardenId?: string): Promise<Harvest[]> {
    try {
      return await localDataService.getHarvests(gardenId);
    } catch (error) {
      console.error('Error getting harvests:', error);
      return [];
    }
  },

  async getHarvest(id: string): Promise<Harvest | null> {
    try {
      return await localDataService.getHarvest(id);
    } catch (error) {
      console.error('Error getting harvest:', error);
      return null;
    }
  },

  async createHarvest(harvest: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'> | Harvest): Promise<Harvest> {
    try {
      const isGuest = await isGuestMode();
      
      if (!isGuest) {
        const user = await authService.getCurrentUser();
        if (!user) {
          console.log('No authenticated user detected, enabling guest mode for local persistence');
          await AsyncStorage.setItem('@GardenTracker:guestMode', 'true');
        }
      }

      return await localDataService.createHarvest(harvest);
    } catch (error) {
      console.error('Error creating harvest:', error);
      throw error;
    }
  },

  async updateHarvest(id: string, updates: Partial<Harvest>): Promise<Harvest> {
    try {
      const isGuest = await isGuestMode();

      if (!isGuest) {
        const user = await authService.getCurrentUser();
        if (!user) {
          console.log('No authenticated user detected, enabling guest mode for local persistence');
          await AsyncStorage.setItem('@GardenTracker:guestMode', 'true');
        }
      }

      return await localDataService.updateHarvest(id, updates);
    } catch (error) {
      console.error('Error updating harvest:', error);
      throw error;
    }
  },

  async deleteHarvest(id: string): Promise<void> {
    try {
      const isGuest = await isGuestMode();

      if (!isGuest) {
        const user = await authService.getCurrentUser();
        if (!user) {
          console.log('No authenticated user detected, enabling guest mode for local persistence');
          await AsyncStorage.setItem('@GardenTracker:guestMode', 'true');
        }
      }

      await localDataService.deleteHarvest(id);
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
