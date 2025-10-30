import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-get-random-values'; // Must be first import for uuid to work
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';
import LoadingAnimation from '../components/LoadingAnimation';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { initServices } from '../lib/services';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading, isGuest } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [servicesReady, setServicesReady] = useState(false);

  useEffect(() => {
    // Hide the default expo splash screen immediately
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    };
    hideSplash();
  }, []);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | null = null;

    const bootstrapServices = async () => {
      try {
        cleanup = await initServices();
      } catch (error) {
        console.error('Failed to initialize services:', error);
      } finally {
        if (mounted) {
          setServicesReady(true);
        }
      }
    };

    bootstrapServices();

    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show our custom animated splash screen
  if (showSplash) {
    return <AnimatedSplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // Show loading screen while checking authentication
  if (!servicesReady || isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#F5F5F5' 
      }}>
        <LoadingAnimation size={50} />
      </View>
    );
  }

  // If no user and not guest, show sign in
  if (!user && !isGuest) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: '#fff' 
          },
        }}
      >
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // User is logged in or in guest mode - show main app
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { 
          backgroundColor: '#fff' 
        },
        animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="garden/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="garden/new" options={{ headerShown: false }} />
      <Stack.Screen name="garden/edit/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="harvest/new" options={{ headerShown: false }} />
      <Stack.Screen name="harvest/edit/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
