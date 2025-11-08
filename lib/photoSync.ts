import AsyncStorage from '@react-native-async-storage/async-storage';
import { gardenService } from './dataService';
import { uploadImage } from './storage';

export const syncPendingPhotos = async () => {
  try {
    console.log('Starting pending photos sync...');
    
    // Get all AsyncStorage keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter for pending photo keys
    const pendingPhotoKeys = keys.filter(key => key.startsWith('@GardenTracker:pendingPhoto:'));
    
    if (pendingPhotoKeys.length === 0) {
      console.log('No pending photos to sync');
      return;
    }
    
    console.log(`Found ${pendingPhotoKeys.length} pending photos to sync`);
    
    // Process each pending photo
    for (const key of pendingPhotoKeys) {
      try {
        // Get the local URI
        const localUri = await AsyncStorage.getItem(key);
        if (!localUri) continue;
        
        console.log('Processing pending photo:', key);
        
        // Upload to Firebase Storage
        const storagePath = `gardens/garden_${Date.now()}`;
        const firebaseUrl = await uploadImage(localUri, storagePath);
        
        // Update any gardens that use this local URI
        const gardens = await gardenService.getGardens();
        for (const garden of gardens) {
          if (garden.photoUrl === localUri) {
            console.log('Updating garden photo URL:', garden.id);
            await gardenService.updateGarden(garden.id, {
              ...garden,
              photoUrl: firebaseUrl
            });
          }
        }
        
        // Remove the pending photo entry
        await AsyncStorage.removeItem(key);
        console.log('Successfully processed and removed pending photo:', key);
        
      } catch (error) {
        console.error('Error processing pending photo:', key, error);
        // Continue with next photo even if one fails
      }
    }
    
    console.log('Completed pending photos sync');
  } catch (error) {
    console.error('Error in syncPendingPhotos:', error);
    throw error;
  }
};

export const hasPendingPhotos = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.some(key => key.startsWith('@GardenTracker:pendingPhoto:'));
  } catch (error) {
    console.error('Error checking for pending photos:', error);
    return false;
  }
};