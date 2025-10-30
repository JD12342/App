import NetInfo from '@react-native-community/netinfo';
import type { User } from 'firebase/auth';
import { Garden, Harvest } from '../types/types';
import { authService } from './auth';
import database from './database';
import { createSyncService, type SyncService } from './sync';
import { dataService as unifiedDataService } from './unifiedDataService';

/**
 * Garden Service - Mobile-only implementation with performance optimizations
 */
export const gardenService = {
  // Cache for gardens to avoid repeated DB queries
  _gardensCache: null as Garden[] | null,
  _lastFetch: 0,
  _cacheTimeout: 30000, // Reduced from 60s to 30s for more frequent updates

  invalidateCache(): void {
    this._gardensCache = null;
    this._lastFetch = 0;
  },
  
  async getGardens(): Promise<Garden[]> {
    try {
      // Use cache if it's less than 30 seconds old
      const now = Date.now();
      if (this._gardensCache && now - this._lastFetch < this._cacheTimeout) {
        return this._gardensCache;
      }

      const gardens = await unifiedDataService.getGardens();
      this._gardensCache = gardens;
      this._lastFetch = now;
      return gardens;
    } catch (error) {
      console.error('Error getting gardens:', error);
      return this._gardensCache || [];
    }
  },

  async getGarden(id: string): Promise<Garden | null> {
    try {
      // Check cache first for faster access
      if (this._gardensCache) {
        const cachedGarden = this._gardensCache.find(g => g.id === id);
        if (cachedGarden) return cachedGarden;
      }
      
      return await unifiedDataService.getGarden(id);
    } catch (error) {
      console.error('Error getting garden:', error);
      return null;
    }
  },

  async createGarden(garden: Omit<Garden, 'id' | 'createdAt' | 'updatedAt'>): Promise<Garden | null> {
    try {
      const result = await unifiedDataService.createGarden(garden);

      this.invalidateCache();

      return result;
    } catch (error) {
      console.error('Error creating garden:', error);
      return null;
    }
  },

  async updateGarden(id: string, updates: Partial<Garden>): Promise<Garden | null> {
    try {
      const updatedGarden = await unifiedDataService.updateGarden(id, updates);

      this.invalidateCache();

      return updatedGarden;
    } catch (error) {
      console.error('Error updating garden:', error);
      return null;
    }
  },

  async deleteGarden(id: string): Promise<boolean> {
    try {
      await unifiedDataService.deleteGarden(id);

      this.invalidateCache();

      return true;
    } catch (error) {
      console.error('Error deleting garden:', error);
      return false;
    }
  },
};

/**
 * Harvest Service - Mobile-only implementation with performance optimizations
 */
export const harvestService = {
  // Cache for harvests to avoid repeated DB queries
  _harvestsCache: null as Harvest[] | null,
  _lastFetch: 0,

  invalidateCache(): void {
    this._harvestsCache = null;
    this._lastFetch = 0;
  },
  
  async getHarvests(): Promise<Harvest[]> {
    try {
      // Use cache if it's less than 60 seconds old
      const now = Date.now();
      if (this._harvestsCache && now - this._lastFetch < 60000) {
        return this._harvestsCache;
      }

      const harvests = await unifiedDataService.getHarvests();
      this._harvestsCache = harvests;
      this._lastFetch = now;
      return harvests;
    } catch (error) {
      console.error('Error getting harvests:', error);
      return this._harvestsCache || [];
    }
  },

  async getHarvest(id: string): Promise<Harvest | null> {
    try {
      return await unifiedDataService.getHarvest(id);
    } catch (error) {
      console.error('Error getting harvest:', error);
      return null;
    }
  },

  async getHarvestsByGarden(gardenId: string): Promise<Harvest[]> {
    try {
      return await unifiedDataService.getHarvests(gardenId);
    } catch (error) {
      console.error('Error getting harvests by garden:', error);
      return [];
    }
  },

  async createHarvest(harvest: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Harvest | null> {
    try {
      const result = await unifiedDataService.createHarvest(harvest);

      this.invalidateCache();

      return result;
    } catch (error) {
      console.error('Error creating harvest:', error);
      return null;
    }
  },

  async updateHarvest(id: string, updates: Partial<Harvest>): Promise<Harvest | null> {
    try {
      const updatedHarvest = await unifiedDataService.updateHarvest(id, updates);

      this.invalidateCache();

      return updatedHarvest;
    } catch (error) {
      console.error('Error updating harvest:', error);
      return null;
    }
  },

  async deleteHarvest(id: string): Promise<boolean> {
    try {
      await unifiedDataService.deleteHarvest(id);

      this.invalidateCache();

      return true;
    } catch (error) {
      console.error('Error deleting harvest:', error);
      return false;
    }
  },
};

/**
 * Main Data Service - Mobile-only implementation
 */
class DataService {
  private isInitialized = false;
  private syncService: SyncService | null = null;
  private autoSyncTimer: ReturnType<typeof setInterval> | null = null;
  private authUnsubscribe: (() => void) | null = null;
  private netInfoUnsubscribe: (() => void) | null = null;
  private currentUserId: string | null = null;
  private syncing = false;
  private syncQueued = false;

  /**
   * Initialize the data service
   * Returns a cleanup function
   */
  async initialize(): Promise<() => void> {
    if (this.isInitialized) {
      console.log('Data service already initialized');
      return this.cleanup.bind(this);
    }

    try {
      console.log('Initializing data service...');

      await database.initDatabase();
      this.syncService = createSyncService(() => authService.getCurrentUser());

      this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected && state.isInternetReachable !== false) {
          void this.runSync('network');
        }
      });

      this.authUnsubscribe = authService.subscribeToAuthChanges((user) => {
        void this.handleAuthChange(user);
      });

      const initialUser = await authService.getCurrentUser();
      await this.handleAuthChange(initialUser);

      this.isInitialized = true;
      console.log('Data service initialized successfully');

      return this.cleanup.bind(this);
    } catch (error) {
      console.error('Error initializing data service:', error);
      this.cleanup();
      throw error;
    }
  }

  private async handleAuthChange(user: User | null): Promise<void> {
    const newUserId = user?.uid ?? null;

    if (newUserId !== this.currentUserId) {
      if (!newUserId) {
        this.currentUserId = null;
        this.stopAutoSync();
        gardenService.invalidateCache();
        harvestService.invalidateCache();
        return;
      }

      this.currentUserId = newUserId;
      await this.runSync('auth-change');
      this.startAutoSync();
      return;
    }

    if (newUserId) {
      await this.runSync('auth-refresh');
    }
  }

  private startAutoSync(intervalMs: number = 60000): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }

    this.autoSyncTimer = setInterval(() => {
      void this.runSync('interval');
    }, intervalMs);

    console.log(`Auto sync scheduled every ${intervalMs}ms`);
  }

  private stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
      console.log('Auto sync stopped');
    }
  }

  private async runSync(reason: string): Promise<void> {
    if (!this.syncService) {
      return;
    }

    if (this.syncing) {
      this.syncQueued = true;
      return;
    }

    this.syncing = true;
    try {
      await this.syncService.syncNow();
      gardenService.invalidateCache();
      harvestService.invalidateCache();
    } catch (error) {
      console.error(`Sync failed (${reason}):`, error);
    } finally {
      this.syncing = false;
      if (this.syncQueued) {
        this.syncQueued = false;
        await this.runSync('queued');
      }
    }
  }

  /**
   * Cleanup function
   */
  private cleanup(): void {
    this.stopAutoSync();

    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }

    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }

    this.syncService = null;
    this.currentUserId = null;
    this.isInitialized = false;
    console.log('Data service cleaned up');
  }

  async syncNow(): Promise<void> {
    await this.runSync('manual');
  }

  async isOnline(): Promise<boolean> {
    if (this.syncService) {
      return await this.syncService.isOnline();
    }

    const netState = await NetInfo.fetch();
    return netState.isConnected === true && netState.isInternetReachable !== false;
  }
}

// Export singleton instance
const dataService = new DataService();
export default dataService;
