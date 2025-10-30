import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, isLoading, isGuest } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user || isGuest) {
        // If user is logged in OR in guest mode, go to main app
        console.log("User logged in or in guest mode, redirecting to main app");
        router.replace('/(tabs)');
      } else {
        // Otherwise, go to sign-in
        console.log("No user found, redirecting to sign-in");
        router.replace('/auth/sign-in');
      }
    }
  }, [router, user, isLoading, isGuest]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#fff',
      }}
    >
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
    </View>
  );
}
