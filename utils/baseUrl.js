import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDevUrl = () => {
  const MANUAL_IP = 'https://ridiculous-rocky-drear.ngrok-free.dev';

  // For physical devices (iOS via Expo Go, Android physical device)
  if (Constants.appOwnership !== 'expo') {
    return 'https://api.yourcafapp.com';
  }

  // Try to get the dev server IP from Expo
  const debuggerHost = Constants.expoConfig?.hostUri;

  console.log('=== URL Debug Info ===');
  console.log('Platform:', Platform.OS);
  console.log('debuggerHost:', debuggerHost);
  console.log('MANUAL_IP:', MANUAL_IP);

  // If we have a debugger host, use that (works for both iOS and Android on same network)
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    const url = `http://${host}:8000`;
    console.log('Using Expo host URL:', url);
    return url;
  }

  // Fallback to manual IP for physical devices
  if (MANUAL_IP && MANUAL_IP !== '192.168.1.XXX') {
    const url = `http://${MANUAL_IP}:8000`;
    console.log('Using manual IP URL:', url);
    return url;
  }

  // Last resort fallbacks
  if (Platform.OS === 'android') {
    console.log('Using Android emulator URL');
    return 'http://10.0.2.2:8000';
  }

  console.log('Using localhost fallback (iOS Simulator)');
  return 'http://localhost:8000';
};

const ENV = {
  dev: {
    apiUrl: 'https://ridiculous-rocky-drear.ngrok-free.dev',
  },
  prod: {
    apiUrl: 'https://api.yourcafapp.com',
  },
};

export const API_URL = __DEV__ ? ENV.dev.apiUrl : ENV.prod.apiUrl;

console.log('=== Final API_URL ===');
console.log(API_URL);
console.log('====================');
