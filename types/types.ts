// Garden Tracker Types

// User type for authentication
export interface User {
  id: string;
  email: string;
  name?: string;
}

// Garden type
export interface Garden {
  id: string;
  name: string;
  location?: string;
  description?: string;
  photoUrl?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

// Plant type (could be extended in the future)
export interface Plant {
  name: string;
}

// Units for harvest measurement
export type Unit = 'kg' | 'g' | 'lb' | 'oz' | 'count' | 'bunch';

// Harvest type
export interface Harvest {
  id: string;
  gardenId: string;
  plantName: string;
  quantity: number;
  unit: Unit;
  date: number; // timestamp
  notes?: string;
  photoUrl?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

// Report data structures
export interface PlantTotal {
  plantName: string;
  totalQuantity: number;
  unit: Unit;
}

export interface GardenTotal {
  gardenId: string;
  gardenName: string;
  totalHarvests: number;
  plants: number; // unique plants count
}

// State types
export interface AppState {
  gardens: Garden[];
  harvests: Harvest[];
}
