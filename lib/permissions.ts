import * as FileSystem from 'expo-file-system';
import { Alert, Linking, Platform } from 'react-native';

/**
 * Request necessary permissions for file access and storage
 */
export const requestPermissions = async (): Promise<boolean> => {
  try {
    // Check if file system is accessible
    const documentsDir = FileSystem.Paths?.document;
    if (!documentsDir) {
      console.error('Document directory not accessible');
      Alert.alert(
        'Storage Access',
        'Garden Tracker needs access to your device storage to save files. This permission will be requested when you export a report.',
        [{ text: 'OK' }]
      );
      return true; // Don't block the app, permissions will be requested when needed
    }

    console.log('Storage access available');
    return true;
  } catch (error) {
    console.error('Error checking storage access:', error);
    // Don't block the app, permissions will be requested when needed
    return true;
  }
};

/**
 * Open app settings to enable storage permissions
 */
export const openAppSettings = (): void => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else if (Platform.OS === 'android') {
    Linking.openSettings();
  }
};

/**
 * Show permission reminder to user before export (returns a promise)
 */
export const showExportPermissionReminder = (): Promise<void> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Storage Permission Required',
      'To save your garden report, Garden Tracker needs permission to access your device storage.\n\nIf your phone asks for permission, please tap "Allow". If you deny it, you can enable it in Settings.',
      [
        { 
          text: 'Open Settings', 
          onPress: () => {
            openAppSettings();
            resolve();
          },
          style: 'default',
        },
        { 
          text: 'Continue', 
          onPress: () => resolve(),
          style: 'default',
        }
      ]
    );
  });
};

export default {
  requestPermissions,
  openAppSettings,
  showExportPermissionReminder,
};

