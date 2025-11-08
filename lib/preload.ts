import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

/**
 * PreloadManager handles all the app's preloading tasks
 * This centralizes and optimizes the loading of resources
 */
class PreloadManager {
  _isLoaded = false;
  _loadPromise: Promise<void> | null = null;

  /**
   * Preload all necessary assets
   */
  preloadAssets = async (): Promise<void> => {
    if (this._loadPromise) return this._loadPromise;
    
    this._loadPromise = (async () => {
      try {
        // Load fonts with timeout
        const fontLoadPromise = Font.loadAsync({
          'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });

        // Preload images
        const images = [
          require('../assets/images/icon.png'),
        ];

        // Preload images in parallel with timeout
        const imageLoadPromise = Promise.all(
          images.map(image => 
            Asset.fromModule(image).downloadAsync().catch(err => {
              console.warn('Failed to preload image:', err);
              return null;
            })
          )
        );
        
        // Wait for all assets with timeout
        await Promise.race([
          Promise.all([fontLoadPromise, imageLoadPromise]),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Asset loading timeout')), 8000)
          )
        ]);
        
        this._isLoaded = true;
      } catch (error) {
        console.error('Error preloading assets:', error);
        // Mark as loaded even if there are errors to prevent infinite loading
        this._isLoaded = true;
      }
    })();

    return this._loadPromise;
  };

  /**
   * Check if resources are loaded
   */
  isLoaded = (): boolean => {
    return this._isLoaded;
  };
}

export default new PreloadManager();
