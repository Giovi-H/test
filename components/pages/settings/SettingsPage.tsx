import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from 'utils/ProfileContext';
import { Colors } from 'utils/colors';
import GridBackground from 'components/GridBackdrop';
import BottomNav from 'components/BottomNav';

export default function SettingsPage() {
  const router = useRouter();
  const { setUserId } = useProfile();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUserId('');
    router.replace('/intro');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <GridBackground color1={Colors.background} color2={Colors.border} />
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: 60,
          left: 20,
          zIndex: 10,
          backgroundColor: Colors.navy,
          borderRadius: 100,
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 100, paddingBottom: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', fontStyle: 'italic', color: Colors.navy }}>
          SETTINGS
        </Text>
      </View>

      {/* Logout button */}
      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: Colors.red,
            borderRadius: 100,
            paddingVertical: 14,
            alignItems: 'center',
          }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}
