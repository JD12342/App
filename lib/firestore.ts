import { Garden, Harvest } from '@/types/types';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';

// Firebase collection names
const GARDENS_COLLECTION = 'gardens';
const HARVESTS_COLLECTION = 'harvests';

// Helper function to get user-specific collection path
const getUserCollection = (userId: string, collectionName: string) => {
  return `users/${userId}/${collectionName}`;
};

export const firebaseDB = {
  // Garden operations
  gardens: {
    // Get all gardens for a user
    getAll: async (userId: string): Promise<Garden[]> => {
      try {
        const gardensRef = collection(db, getUserCollection(userId, GARDENS_COLLECTION));
        const snapshot = await getDocs(gardensRef);
        
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            location: data.location,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
      } catch (error) {
        console.error('Error getting gardens from Firebase:', error);
        throw error;
      }
    },

    // Get a garden by ID
    getById: async (userId: string, gardenId: string): Promise<Garden | null> => {
      try {
        const gardenRef = doc(db, getUserCollection(userId, GARDENS_COLLECTION), gardenId);
        const snapshot = await getDoc(gardenRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          return {
            id: snapshot.id,
            name: data.name,
            location: data.location,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error getting garden from Firebase:', error);
        throw error;
      }
    },

    // Add or update a garden
    save: async (userId: string, garden: Garden): Promise<void> => {
      try {
        const gardenRef = doc(db, getUserCollection(userId, GARDENS_COLLECTION), garden.id);
        await setDoc(gardenRef, {
          name: garden.name,
          location: garden.location,
          createdAt: garden.createdAt,
          updatedAt: garden.updatedAt,
        });
      } catch (error) {
        console.error('Error saving garden to Firebase:', error);
        throw error;
      }
    },

    // Delete a garden
    delete: async (userId: string, gardenId: string): Promise<void> => {
      try {
        const gardenRef = doc(db, getUserCollection(userId, GARDENS_COLLECTION), gardenId);
        await deleteDoc(gardenRef);
      } catch (error) {
        console.error('Error deleting garden from Firebase:', error);
        throw error;
      }
    },

    // Subscribe to garden changes
    subscribe: (userId: string, onUpdate: (gardens: Garden[]) => void) => {
      const gardensRef = collection(db, getUserCollection(userId, GARDENS_COLLECTION));
      
      return onSnapshot(gardensRef, (snapshot) => {
        const gardens = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            location: data.location,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        
        onUpdate(gardens);
      }, (error) => {
        console.error('Error subscribing to gardens:', error);
      });
    },
  },

  // Harvest operations
  harvests: {
    // Get all harvests for a user
    getAll: async (userId: string): Promise<Harvest[]> => {
      try {
        const harvestsRef = collection(db, getUserCollection(userId, HARVESTS_COLLECTION));
        const snapshot = await getDocs(harvestsRef);
        
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            gardenId: data.gardenId,
            plantName: data.plantName,
            quantity: data.quantity,
            unit: data.unit,
            date: data.date,
            notes: data.notes,
            photoUrl: data.photoUrl,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
      } catch (error) {
        console.error('Error getting harvests from Firebase:', error);
        throw error;
      }
    },

    // Get harvests for a specific garden
    getByGarden: async (userId: string, gardenId: string): Promise<Harvest[]> => {
      try {
        const harvestsRef = collection(db, getUserCollection(userId, HARVESTS_COLLECTION));
        const q = query(harvestsRef, where('gardenId', '==', gardenId));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            gardenId: data.gardenId,
            plantName: data.plantName,
            quantity: data.quantity,
            unit: data.unit,
            date: data.date,
            notes: data.notes,
            photoUrl: data.photoUrl,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
      } catch (error) {
        console.error('Error getting harvests from Firebase:', error);
        throw error;
      }
    },

    // Get a harvest by ID
    getById: async (userId: string, harvestId: string): Promise<Harvest | null> => {
      try {
        const harvestRef = doc(db, getUserCollection(userId, HARVESTS_COLLECTION), harvestId);
        const snapshot = await getDoc(harvestRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          return {
            id: snapshot.id,
            gardenId: data.gardenId,
            plantName: data.plantName,
            quantity: data.quantity,
            unit: data.unit,
            date: data.date,
            notes: data.notes,
            photoUrl: data.photoUrl,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error getting harvest from Firebase:', error);
        throw error;
      }
    },

    // Add or update a harvest
    save: async (userId: string, harvest: Harvest): Promise<void> => {
      try {
        const harvestRef = doc(db, getUserCollection(userId, HARVESTS_COLLECTION), harvest.id);
        await setDoc(harvestRef, {
          gardenId: harvest.gardenId,
          plantName: harvest.plantName,
          quantity: harvest.quantity,
          unit: harvest.unit,
          date: harvest.date,
          notes: harvest.notes,
          photoUrl: harvest.photoUrl,
          createdAt: harvest.createdAt,
          updatedAt: harvest.updatedAt,
        });
      } catch (error) {
        console.error('Error saving harvest to Firebase:', error);
        throw error;
      }
    },

    // Delete a harvest
    delete: async (userId: string, harvestId: string): Promise<void> => {
      try {
        const harvestRef = doc(db, getUserCollection(userId, HARVESTS_COLLECTION), harvestId);
        await deleteDoc(harvestRef);
      } catch (error) {
        console.error('Error deleting harvest from Firebase:', error);
        throw error;
      }
    },

    // Subscribe to harvest changes for a garden
    subscribeByGarden: (userId: string, gardenId: string, onUpdate: (harvests: Harvest[]) => void) => {
      const harvestsRef = collection(db, getUserCollection(userId, HARVESTS_COLLECTION));
      const q = query(harvestsRef, where('gardenId', '==', gardenId));
      
      return onSnapshot(q, (snapshot) => {
        const harvests = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            gardenId: data.gardenId,
            plantName: data.plantName,
            quantity: data.quantity,
            unit: data.unit,
            date: data.date,
            notes: data.notes,
            photoUrl: data.photoUrl,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        
        onUpdate(harvests);
      }, (error) => {
        console.error('Error subscribing to harvests:', error);
      });
    },
  },
};
