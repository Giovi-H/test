import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Caveat_700Bold } from '@expo-google-fonts/caveat';

type Props = {
  variant: 'login' | 'register';
};

export default function IntroButton({ variant }: Props) {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Caveat_700Bold });

  const isLogin = variant === 'login';

  const handlePress = () => {
    if (isLogin) {
      router.push('/intro/login');
    } else {
      router.push('/intro/survey');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: isLogin ? '#1a1a2e' : '#ffffff',
        borderRadius: 50,
        width: 220,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: fontsLoaded ? 'Caveat_700Bold' : undefined,
          fontSize: 22,
          color: isLogin ? '#ffffff' : '#1a1a2e',
        }}
      >
        {isLogin ? 'log in' : 'register'}
      </Text>
    </TouchableOpacity>
  );
}