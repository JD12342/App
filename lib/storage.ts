import * as FileSystem from 'expo-file-system/legacy';

export const uploadImageBackground = async (
  uri: string,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  console.log('Persisting image locally...', { uri, path });

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      console.error('File does not exist:', uri);
      return uri;
    }

    const persistedUri = await persistImageLocally(uri, path, onProgress);
    console.log('Image stored locally at:', persistedUri);
    return persistedUri;
  } catch (error) {
    console.error('Failed to persist image locally, keeping original URI:', error);
    return uri;
  }
};

export const uploadImage = uploadImageBackground;

export const generateUniqueFileName = (originalUri: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = originalUri.split('.').pop() || 'jpg';
  return `${timestamp}-${random}.${extension}`;
};

async function persistImageLocally(
  uri: string,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!FileSystem.documentDirectory) {
    console.warn('Document directory unavailable; returning original URI');
    return uri;
  }

  const imagesDir = `${FileSystem.documentDirectory}images`;

  try {
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }
  } catch (error) {
    console.error('Unable to create images directory, returning original URI:', error);
    return uri;
  }

  const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const filename = `${path}_${timestamp}_${random}.${extension}`.replace(/\s+/g, '_');
  const destination = `${imagesDir}/${filename}`;

  try {
    onProgress?.(0);
    await FileSystem.copyAsync({ from: uri, to: destination });
    onProgress?.(100);
    return destination;
  } catch (error) {
    console.error('Error copying image to app storage, returning original URI:', error);
    return uri;
  }
}