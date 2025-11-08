import { Garden, Harvest } from '@/types/types';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';

const GARDENS_COLLECTION = 'gardens';
const HARVESTS_COLLECTION = 'harvests';

const getUserCollection = (userId: string, collectionName: string) => {
  return `users/${userId}/${collectionName}`;
};

export const firebaseDB = {
  gardens: {
    getAll: async (userId: string): Promise<Garden[]> => {
      try {
        const gardensRef = collection(db!, getUserCollection(userId, GARDENS_COLLECTION));
        const snapshot = await getDocs(gardensRef);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          location: doc.data().location,
          description: doc.data().description,
          photoUrl: doc.data().photoUrl,
          createdAt: doc.data().createdAt,
          updatedAt: doc.data().updatedAt,
        }));
      } catch (error) {
        console.error('Error getting gardens from Firebase:', error);
        throw error;
      }
    },
    getById: async (userId: string, gardenId: string): Promise<Garden | null> => {
      try {
        const gardenRef = doc(db!, getUserCollection(userId, GARDENS_COLLECTION), gardenId);
        const snapshot = await getDoc(gardenRef);
        if (snapshot.exists()) {
          return {
            id: snapshot.id,
            name: snapshot.data().name,
            location: snapshot.data().location,
            description: snapshot.data().description,
            photoUrl: snapshot.data().photoUrl,
            createdAt: snapshot.data().createdAt,
            updatedAt: snapshot.data().updatedAt,
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting garden from Firebase:', error);
        throw error;
      }
    },
    save: async (userId: string, garden: Garden): Promise<void> => {
      try {
        const gardenRef = doc(db!, getUserCollection(userId, GARDENS_COLLECTION), garden.id);
        const gardenData: Record<string, unknown> = {
          name: garden.name,
          createdAt: garden.createdAt,
          updatedAt: garden.updatedAt,
        };

        if (garden.location !== undefined) gardenData.location = garden.location;
        if (garden.description !== undefined) gardenData.description = garden.description;
        if (garden.photoUrl !== undefined) gardenData.photoUrl = garden.photoUrl;

        console.log('Saving garden data:', gardenData);
        await setDoc(gardenRef, gardenData);
        console.log('Garden saved successfully');
      } catch (error) {
        console.error('Error saving garden to Firebase:', error);
        throw error;
      }
    },
    delete: async (userId: string, gardenId: string): Promise<void> => {
      try {
        const gardenRef = doc(db!, getUserCollection(userId, GARDENS_COLLECTION), gardenId);
        await deleteDoc(gardenRef);
      } catch (error) {
        console.error('Error deleting garden from Firebase:', error);
        throw error;
      }
    },
    subscribe: (userId: string, onUpdate: (gardens: Garden[]) => void) => {
      const gardensRef = collection(db!, getUserCollection(userId, GARDENS_COLLECTION));
      return onSnapshot(gardensRef, (snapshot) => {
        const gardens = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          location: doc.data().location,
          description: doc.data().description,
          photoUrl: doc.data().photoUrl,
          createdAt: doc.data().createdAt,
          updatedAt: doc.data().updatedAt,
        }));
        onUpdate(gardens);
      }, (error) => {
        console.error('Error subscribing to gardens:', error);
      });
    },
  },
  harvests: {
    getAll: async (userId: string): Promise<Harvest[]> => {
      try {
        const harvestsRef = collection(db!, getUserCollection(userId, HARVESTS_COLLECTION));
        const snapshot = await getDocs(harvestsRef);
        return snapshot.docs.map(doc => ({
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
      } catch (error) {
        console.error('Error getting harvests from Firebase:', error);
        throw error;
      }
    },
    getByGarden: async (userId: string, gardenId: string): Promise<Harvest[]> => {
      try {
        const harvestsRef = collection(db!, getUserCollection(userId, HARVESTS_COLLECTION));
        const q = query(harvestsRef, where('gardenId', '==', gardenId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
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
      } catch (error) {
        console.error('Error getting harvests from Firebase:', error);
        throw error;
      }
    },
    getById: async (userId: string, harvestId: string): Promise<Harvest | null> => {
      try {
        const harvestRef = doc(db!, getUserCollection(userId, HARVESTS_COLLECTION), harvestId);
        const snapshot = await getDoc(harvestRef);
        if (snapshot.exists()) {
          return {
            id: snapshot.id,
            gardenId: snapshot.data().gardenId,
            plantName: snapshot.data().plantName,
            quantity: snapshot.data().quantity,
            unit: snapshot.data().unit,
            date: snapshot.data().date,
            notes: snapshot.data().notes,
            photoUrl: snapshot.data().photoUrl,
            createdAt: snapshot.data().createdAt,
            updatedAt: snapshot.data().updatedAt,
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting harvest from Firebase:', error);
        throw error;
      }
    },
    save: async (userId: string, harvest: Harvest): Promise<void> => {
      try {
        const harvestRef = doc(db!, getUserCollection(userId, HARVESTS_COLLECTION), harvest.id);
        const harvestData: any = {
          gardenId: harvest.gardenId,
          plantName: harvest.plantName,
          quantity: harvest.quantity,
          unit: harvest.unit,
          date: harvest.date,
          createdAt: harvest.createdAt,
          updatedAt: harvest.updatedAt,
        };
        if (harvest.notes !== undefined) harvestData.notes = harvest.notes;
        if (harvest.photoUrl !== undefined) harvestData.photoUrl = harvest.photoUrl;
        await setDoc(harvestRef, harvestData);
      } catch (error) {
        console.error('Error saving harvest to Firebase:', error);
        throw error;
      }
    },
    delete: async (userId: string, harvestId: string): Promise<void> => {
      try {
        const harvestRef = doc(db!, getUserCollection(userId, HARVESTS_COLLECTION), harvestId);
        await deleteDoc(harvestRef);
      } catch (error) {
        console.error('Error deleting harvest from Firebase:', error);
        throw error;
      }
    },
    subscribeByGarden: (userId: string, gardenId: string, onUpdate: (harvests: Harvest[]) => void) => {
      const harvestsRef = collection(db!, getUserCollection(userId, HARVESTS_COLLECTION));
      const q = query(harvestsRef, where('gardenId', '==', gardenId));
      return onSnapshot(q, (snapshot) => {
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
      }, (error) => {
        console.error('Error subscribing to harvests:', error);
      });
    },
  },
};
