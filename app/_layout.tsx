// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    });
    return unsubscribe;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}