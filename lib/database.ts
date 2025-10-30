import { Garden, Harvest } from '@/types/types';
import * as SQLite from 'expo-sqlite';

// Database name
const DB_NAME = 'garden_tracker.db';

// Initialize database by creating tables if they don't exist
export const initDatabase = async (): Promise<void> => {
  try {
    // Open the database
    const db = await getDatabase();
    
    // Create tables in a transaction with proper indexes for performance
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS gardens (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS harvests (
        id TEXT PRIMARY KEY,
        garden_id TEXT NOT NULL,
        plant_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        date INTEGER NOT NULL,
        notes TEXT,
        photo_uri TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0
      );
      
      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_gardens_deleted ON gardens(deleted);
      CREATE INDEX IF NOT EXISTS idx_harvests_garden_id ON harvests(garden_id);
      CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(date);
      CREATE INDEX IF NOT EXISTS idx_harvests_deleted ON harvests(deleted);
      CREATE INDEX IF NOT EXISTS idx_harvests_garden_id_deleted ON harvests(garden_id, deleted);
    `);
    
    console.log('Database initialized successfully');
    
    // Close the database connection
    await db.closeAsync();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Helper to get a database connection
const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // Added cache for better performance
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  
  // Enable WAL mode for better performance
  await db.execAsync('PRAGMA journal_mode = WAL;');
  
  // Set additional performance optimizations
  await db.execAsync(`
    PRAGMA synchronous = NORMAL;
    PRAGMA temp_store = MEMORY;
    PRAGMA cache_size = 10000;
  `);
  
  return db;
};

// Garden CRUD Operations
export const gardenDB = {
  // Get all gardens (excluding deleted ones)
  getAll: async (): Promise<Garden[]> => {
    const db = await getDatabase();
    try {
      const results = await db.getAllAsync<any>(
        'SELECT * FROM gardens WHERE deleted = 0;'
      );
      
      return results.map((row: any) => ({
        id: row.id,
        name: row.name,
        location: row.location,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error getting gardens:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Get a garden by ID
  getById: async (id: string): Promise<Garden | null> => {
    const db = await getDatabase();
    try {
      const garden = await db.getFirstAsync<any>(
        'SELECT * FROM gardens WHERE id = ? AND deleted = 0;',
        [id]
      );
      
      if (!garden) {
        return null;
      }
      
      return {
        id: garden.id,
        name: garden.name,
        location: garden.location,
        createdAt: garden.created_at,
        updatedAt: garden.updated_at,
      };
    } catch (error) {
      console.error('Error getting garden:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Add a new garden
  add: async (garden: Garden): Promise<string> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        `INSERT INTO gardens (
          id, name, location, created_at, updated_at, synced, deleted
        ) VALUES (?, ?, ?, ?, ?, 0, 0);`,
        [
          garden.id,
          garden.name,
          garden.location || null,
          garden.createdAt,
          garden.updatedAt,
        ]
      );
      
      if (result.changes === 0) {
        throw new Error('Failed to add garden');
      }
      
      return garden.id;
    } catch (error) {
      console.error('Error adding garden:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Update a garden
  update: async (garden: Garden): Promise<boolean> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        `UPDATE gardens SET 
          name = ?, 
          location = ?, 
          updated_at = ?, 
          synced = 0 
        WHERE id = ? AND deleted = 0;`,
        [
          garden.name,
          garden.location || null,
          garden.updatedAt,
          garden.id,
        ]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating garden:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Delete a garden (soft delete)
  delete: async (id: string): Promise<boolean> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        `UPDATE gardens SET deleted = 1, synced = 0, updated_at = ? WHERE id = ?;`,
        [Date.now(), id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting garden:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Get unsynced gardens
  getUnsynced: async (): Promise<(Garden & { deleted: number })[]> => {
    const db = await getDatabase();
    try {
      const results = await db.getAllAsync<any>(
        'SELECT * FROM gardens WHERE synced = 0;'
      );
      
      return results.map((row) => ({
        id: row.id,
        name: row.name,
        location: row.location,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deleted: row.deleted,
      }));
    } catch (error) {
      console.error('Error getting unsynced gardens:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Mark garden as synced
  markSynced: async (id: string): Promise<boolean> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'UPDATE gardens SET synced = 1 WHERE id = ?;',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error marking garden as synced:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Save gardens from Firebase (upsert)
  saveFromFirebase: async (garden: Garden): Promise<boolean> => {
    const db = await getDatabase();
    try {
      // Check if garden exists
      const existingGarden = await db.getFirstAsync<any>(
        'SELECT * FROM gardens WHERE id = ?;',
        [garden.id]
      );
      
      if (existingGarden) {
        // Only update if the Firebase record is newer
        if (garden.updatedAt > existingGarden.updated_at) {
          const result = await db.runAsync(
            `UPDATE gardens SET 
              name = ?, 
              location = ?, 
              updated_at = ?, 
              synced = 1,
              deleted = 0
            WHERE id = ?;`,
            [
              garden.name,
              garden.location || null,
              garden.updatedAt,
              garden.id,
            ]
          );
          
          return result.changes > 0;
        }
        
        return false; // Local version is newer or same
      } else {
        // Insert new garden
        const result = await db.runAsync(
          `INSERT INTO gardens (
            id, name, location, created_at, updated_at, synced, deleted
          ) VALUES (?, ?, ?, ?, ?, 1, 0);`,
          [
            garden.id,
            garden.name,
            garden.location || null,
            garden.createdAt,
            garden.updatedAt,
          ]
        );
        
        return result.changes > 0;
      }
    } catch (error) {
      console.error('Error saving garden from Firebase:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Permanently delete a garden (after confirming it's been deleted from Firebase)
  permanentlyDelete: async (id: string): Promise<boolean> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM gardens WHERE id = ? AND deleted = 1;',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error permanently deleting garden:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Remove all garden records (used for guest reset or sign-out cleanup)
  clearAll: async (): Promise<void> => {
    const db = await getDatabase();
    try {
      await db.execAsync('DELETE FROM gardens;');
    } catch (error) {
      console.error('Error clearing gardens table:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },
};

// Harvest CRUD Operations
export const harvestDB = {
  // Get all harvests (excluding deleted ones)
  getAll: async (): Promise<Harvest[]> => {
    const db = await getDatabase();
    try {
      const results = await db.getAllAsync<any>(
        'SELECT * FROM harvests WHERE deleted = 0 ORDER BY date DESC;'
      );
      
      return results.map((row) => ({
        id: row.id,
        gardenId: row.garden_id,
        plantName: row.plant_name,
        quantity: row.quantity,
        unit: row.unit,
        date: row.date,
        notes: row.notes,
        photoUrl: row.photo_uri,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error getting all harvests:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Get all harvests for a garden (excluding deleted ones)
  getByGarden: async (gardenId: string): Promise<Harvest[]> => {
    const db = await getDatabase();
    try {
      const results = await db.getAllAsync<any>(
        'SELECT * FROM harvests WHERE garden_id = ? AND deleted = 0 ORDER BY date DESC;',
        [gardenId]
      );
      
      return results.map((row) => ({
        id: row.id,
        gardenId: row.garden_id,
        plantName: row.plant_name,
        quantity: row.quantity,
        unit: row.unit,
        date: row.date,
        notes: row.notes,
        photoUrl: row.photo_uri,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error getting harvests:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Get a harvest by ID
  getById: async (id: string): Promise<Harvest | null> => {
    const db = await getDatabase();
    try {
      const harvest = await db.getFirstAsync<any>(
        'SELECT * FROM harvests WHERE id = ? AND deleted = 0;',
        [id]
      );
      
      if (!harvest) {
        return null;
      }
      
      return {
        id: harvest.id,
        gardenId: harvest.garden_id,
        plantName: harvest.plant_name,
        quantity: harvest.quantity,
        unit: harvest.unit,
        date: harvest.date,
        notes: harvest.notes,
        photoUrl: harvest.photo_uri,
        createdAt: harvest.created_at,
        updatedAt: harvest.updated_at,
      };
    } catch (error) {
      console.error('Error getting harvest:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Add a new harvest
  add: async (harvest: Harvest): Promise<string> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        `INSERT INTO harvests (
          id, garden_id, plant_name, quantity, unit, date, notes, photo_uri, 
          created_at, updated_at, synced, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0);`,
        [
          harvest.id,
          harvest.gardenId,
          harvest.plantName,
          harvest.quantity,
          harvest.unit,
          harvest.date,
          harvest.notes || null,
          harvest.photoUrl || null,
          harvest.createdAt,
          harvest.updatedAt,
        ]
      );
      
      if (result.changes === 0) {
        throw new Error('Failed to add harvest');
      }
      
      return harvest.id;
    } catch (error) {
      console.error('Error adding harvest:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Update a harvest
  update: async (harvest: Harvest): Promise<boolean> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        `UPDATE harvests SET 
          garden_id = ?,
          plant_name = ?, 
          quantity = ?, 
          unit = ?, 
          date = ?, 
          notes = ?, 
          photo_uri = ?, 
          updated_at = ?, 
          synced = 0 
        WHERE id = ? AND deleted = 0;`,
        [
          harvest.gardenId,
          harvest.plantName,
          harvest.quantity,
          harvest.unit,
          harvest.date,
          harvest.notes || null,
          harvest.photoUrl || null,
          harvest.updatedAt,
          harvest.id,
        ]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating harvest:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Delete a harvest (soft delete)
  delete: async (id: string): Promise<boolean> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        `UPDATE harvests SET deleted = 1, synced = 0, updated_at = ? WHERE id = ?;`,
        [Date.now(), id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting harvest:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Get unsynced harvests
  getUnsynced: async (): Promise<(Harvest & { deleted: number })[]> => {
    const db = await getDatabase();
    try {
      const results = await db.getAllAsync<any>(
        'SELECT * FROM harvests WHERE synced = 0;'
      );
      
      return results.map((row) => ({
        id: row.id,
        gardenId: row.garden_id,
        plantName: row.plant_name,
        quantity: row.quantity,
        unit: row.unit,
        date: row.date,
        notes: row.notes,
        photoUrl: row.photo_uri,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deleted: row.deleted,
      }));
    } catch (error) {
      console.error('Error getting unsynced harvests:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Mark harvest as synced
  markSynced: async (id: string): Promise<boolean> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'UPDATE harvests SET synced = 1 WHERE id = ?;',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error marking harvest as synced:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Save harvests from Firebase (upsert)
  saveFromFirebase: async (harvest: Harvest): Promise<boolean> => {
    const db = await getDatabase();
    try {
      // Check if harvest exists
      const existingHarvests = await db.getAllAsync<any>(
        'SELECT * FROM harvests WHERE id = ?;',
        [harvest.id]
      );
      
      if (existingHarvests.length > 0) {
        const existingHarvest = existingHarvests[0];
        
        // Only update if the Firebase record is newer
        if (harvest.updatedAt > existingHarvest.updated_at) {
          const result = await db.runAsync(
            `UPDATE harvests SET 
              garden_id = ?,
              plant_name = ?, 
              quantity = ?, 
              unit = ?, 
              date = ?, 
              notes = ?, 
              photo_uri = ?, 
              updated_at = ?, 
              synced = 1,
              deleted = 0
            WHERE id = ?;`,
            [
              harvest.gardenId,
              harvest.plantName,
              harvest.quantity,
              harvest.unit,
              harvest.date,
              harvest.notes || null,
              harvest.photoUrl || null,
              harvest.updatedAt,
              harvest.id,
            ]
          );
          return result.changes > 0;
        } else {
          return false; // Local version is newer or same
        }
      } else {
        // Insert new harvest
        const result = await db.runAsync(
          `INSERT INTO harvests (
            id, garden_id, plant_name, quantity, unit, date, notes, photo_uri, 
            created_at, updated_at, synced, deleted
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0);`,
          [
            harvest.id,
            harvest.gardenId,
            harvest.plantName,
            harvest.quantity,
            harvest.unit,
            harvest.date,
            harvest.notes || null,
            harvest.photoUrl || null,
            harvest.createdAt,
            harvest.updatedAt,
          ]
        );
        return result.changes > 0;
      }
    } catch (error) {
      console.error('Error saving harvest from Firebase:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Permanently delete a harvest (after confirming it's been deleted from Firebase)
  permanentlyDelete: async (id: string): Promise<boolean> => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM harvests WHERE id = ? AND deleted = 1;',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error permanently deleting harvest:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },

  // Remove all harvest records (used for guest reset or sign-out cleanup)
  clearAll: async (): Promise<void> => {
    const db = await getDatabase();
    try {
      await db.execAsync('DELETE FROM harvests;');
    } catch (error) {
      console.error('Error clearing harvests table:', error);
      throw error;
    } finally {
      await db.closeAsync();
    }
  },
};

export default {
  initDatabase,
  gardens: gardenDB,
  harvests: harvestDB,
};
