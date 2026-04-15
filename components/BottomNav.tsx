import React from 'react';
import { View, TouchableOpacity, Image, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import { Colors } from 'utils/colors';

type Props = {
  activeTab?: 'home' | 'explore' | 'leaderboard' | 'feed' | 'profile';
  backgroundColor?: string;
};

export default function BottomNav({ activeTab, backgroundColor = Colors.blue }: Props) {
  const router = useRouter();
  const { profileImage } = useProfile();

  const navigate = (tab: string, path: string) => {
    if (activeTab === tab) return;
    router.replace(path as any);
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor,
        paddingVertical: 24,
        paddingHorizontal: 36,
        paddingBottom: Platform.OS === 'ios' ? 28 : 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
      }}>
      <TouchableOpacity disabled={activeTab === 'home'} onPress={() => navigate('home', '/home')}>
        <Image
          source={require('../assets/HomeIcon.png')}
          style={{ width: 22, height: 22, opacity: activeTab === 'home' ? 1 : 0.4 }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        disabled={activeTab === 'explore'}
        onPress={() => navigate('explore', '/explore')}>
        <Image
          source={require('../assets/compass.png')}
          style={{ width: 25, height: 25, opacity: activeTab === 'explore' ? 1 : 0.4 }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        disabled={activeTab === 'leaderboard'}
        onPress={() => navigate('leaderboard', '/leaderboard')}>
        <Text style={{
          fontSize: 13,
          fontWeight: '800',
          color: '#fff',
          opacity: activeTab === 'leaderboard' ? 1 : 0.4,
          letterSpacing: 0.5,
        }}>
          TOP
        </Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={activeTab === 'feed'} onPress={() => navigate('feed', '/feed')}>
        <Image
          source={require('../assets/feed.png')}
          style={{ width: 24, height: 24, opacity: activeTab === 'feed' ? 1 : 0.4 }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        disabled={activeTab === 'profile'}
        onPress={() => navigate('profile', '/profile')}>
        <Image
          source={profileImage}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            opacity: activeTab === 'profile' ? 1 : 0.4,
          }}
        />
      </TouchableOpacity>
    </View>
  );
}