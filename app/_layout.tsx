import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { ProfileProvider } from 'utils/ProfileContext';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from 'utils/ProfileContext';

function AppContent() {
  const { setUserId } = useProfile();

  useEffect(() => {
    const restoreSession = async () => {
      const savedUserId = await AsyncStorage.getItem('userId');
      if (savedUserId) {
        setUserId(savedUserId);
      }
    };
    restoreSession();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
        contentStyle: { backgroundColor: '#F5F5F5' },
        gestureEnabled: true,
      }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="cafe/[id]" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="review/index" options={{ animation: 'none' }} />
      <Stack.Screen name="settings/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="followers/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="user/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="profile/edit" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </GestureHandlerRootView>
  );
}