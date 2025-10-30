import { v4 as uuidv4 } from 'uuid';
import { Garden, Harvest } from '../types/types';
import database from './database';

export interface LocalDataService {
  // Gardens
  getGardens: () => Promise<Garden[]>;
  getGarden: (id: string) => Promise<Garden | null>;
  createGarden: (garden: Omit<Garden, 'id' | 'createdAt' | 'updatedAt'> | Garden) => Promise<Garden>;
  updateGarden: (id: string, updates: Partial<Garden>) => Promise<Garden>;
  deleteGarden: (id: string) => Promise<void>;

  // Harvests
  getHarvests: (gardenId?: string) => Promise<Harvest[]>;
  getHarvest: (id: string) => Promise<Harvest | null>;
  createHarvest: (harvest: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'> | Harvest) => Promise<Harvest>;
  updateHarvest: (id: string, updates: Partial<Harvest>) => Promise<Harvest>;
  deleteHarvest: (id: string) => Promise<void>;

  // Utility
  clearAllData: () => Promise<void>;
  exportData: () => Promise<string>;
}

// Local data service implementation backed by SQLite
export const localDataService: LocalDataService = {
  // Garden methods
  getGardens: async (): Promise<Garden[]> => {
    return await database.gardens.getAll();
  },

  getGarden: async (id: string): Promise<Garden | null> => {
    return await database.gardens.getById(id);
  },

  createGarden: async (gardenData: Omit<Garden, 'id' | 'createdAt' | 'updatedAt'> | Garden): Promise<Garden> => {
    const now = Date.now();
    const base = 'id' in gardenData ? gardenData : { ...gardenData, id: uuidv4() };
    const garden: Garden = {
      ...base,
      createdAt: 'createdAt' in base ? base.createdAt : now,
      updatedAt: now,
    };

    await database.gardens.add(garden);
    return garden;
  },

  updateGarden: async (id: string, updates: Partial<Garden>): Promise<Garden> => {
    const existing = await database.gardens.getById(id);
    if (!existing) {
      throw new Error('Garden not found');
    }

    const updatedGarden: Garden = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    await database.gardens.update(updatedGarden);
    return updatedGarden;
  },

  deleteGarden: async (id: string): Promise<void> => {
    await database.gardens.delete(id);
    // Soft delete related harvests so they sync as deleted
    const harvests = await database.harvests.getByGarden(id);
    await Promise.all(harvests.map(h => database.harvests.delete(h.id)));
  },

  // Harvest methods
  getHarvests: async (gardenId?: string): Promise<Harvest[]> => {
    if (gardenId) {
      return await database.harvests.getByGarden(gardenId);
    }
    return await database.harvests.getAll();
  },

  getHarvest: async (id: string): Promise<Harvest | null> => {
    return await database.harvests.getById(id);
  },

  createHarvest: async (harvestData: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'> | Harvest): Promise<Harvest> => {
    const now = Date.now();
    const base = 'id' in harvestData ? harvestData : { ...harvestData, id: uuidv4() };
    const harvest: Harvest = {
      ...base,
      createdAt: 'createdAt' in base ? base.createdAt : now,
      updatedAt: now,
    };

    await database.harvests.add(harvest);
    return harvest;
  },

  updateHarvest: async (id: string, updates: Partial<Harvest>): Promise<Harvest> => {
    const existing = await database.harvests.getById(id);
    if (!existing) {
      throw new Error('Harvest not found');
    }

    const updatedHarvest: Harvest = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    await database.harvests.update(updatedHarvest);
    return updatedHarvest;
  },

  deleteHarvest: async (id: string): Promise<void> => {
    await database.harvests.delete(id);
  },

  // Utility methods
  clearAllData: async (): Promise<void> => {
    await database.gardens.clearAll();
    await database.harvests.clearAll();
  },

  exportData: async (): Promise<string> => {
    const gardens = await localDataService.getGardens();
    const harvests = await localDataService.getHarvests();

    const exportData = {
      gardens,
      harvests,
      exportDate: new Date().toISOString(),
      version: '2.0',
    };

    return JSON.stringify(exportData, null, 2);
  },
};
