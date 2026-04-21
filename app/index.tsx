import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [destination, setDestination] = useState<'/(tabs)' | '/intro' | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const savedUserId = await AsyncStorage.getItem('userId');
      setDestination(savedUserId ? '/(tabs)' : '/intro');
    };
    checkSession();
  }, []);

  if (!destination) return null;
  return <Redirect href={destination} />;
}
