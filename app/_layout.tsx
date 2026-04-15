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
      }}>
      <Stack.Screen name="home/index" options={{ animation: 'none' }} />
      <Stack.Screen name="explore/index" options={{ animation: 'none' }} />
      <Stack.Screen name="feed/index" options={{ animation: 'none' }} />
      <Stack.Screen name="profile/index" options={{ animation: 'none' }} />
      <Stack.Screen name="review/index" options={{ animation: 'none' }} />
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
