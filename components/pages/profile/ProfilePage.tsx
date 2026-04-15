import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import GridBackground from 'components/GridBackdrop';
import { useRouter } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import BottomNav from 'components/BottomNav';
import { useFollowCounts } from 'utils/useFollowCounts';
import { useReviews } from 'utils/useReviews';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';
import ProfileTabs from 'components/ProfileTabs';
import { useRefresh } from 'utils/useRefresh';

export default function ProfilePage() {
  const router = useRouter();
  const { profileImage, userId } = useProfile();
  const [username, setUsername] = useState('');

  const loadUsername = async () => {
    if (!userId) return;
    const { data } = await supabase.from('users').select('username').eq('id', userId).single();
    if (data) setUsername(data.username);
  };

  const { refreshing, refresh, refreshKey } = useRefresh(async () => {
    await loadUsername();
  });

  const { followerCount, followingCount } = useFollowCounts(userId, refreshKey);
  const { reviews, photos, cafesVisited } = useReviews(userId, refreshKey);

  useEffect(() => {
    loadUsername();
  }, [userId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <GridBackground color1={Colors.background} color2={Colors.border} />
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Settings icon */}
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
        <Text style={{ fontSize: 22 }}>⚙️</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.blue} />
        }>
        {/* Profile Picture */}
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: '#000',
            }}>
            <Image
              source={profileImage}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Name */}
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '900',
              fontStyle: 'italic',
              textAlign: 'center',
              color: Colors.navy,
              fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
            }}>
            WELCOME TO{'\n'}
            {`${username?.toUpperCase()}'S CAFE`}
          </Text>
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 14 }}>
          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            style={{
              backgroundColor: Colors.blue,
              borderRadius: 100,
              paddingHorizontal: 20,
              paddingVertical: 8,
            }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Edit Profile</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.blue,
              borderRadius: 100,
              paddingHorizontal: 14,
              paddingVertical: 8,
              gap: 6,
            }}>
            <Text
              style={{
                backgroundColor: Colors.blue,
                color: '#ffff',
                fontWeight: '600',
                fontSize: 13,
              }}>
              Expertise
            </Text>
            <View
              style={{
                backgroundColor: Colors.red,
                borderRadius: 100,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>DRINKS</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => router.push(`/followers/${userId}?type=followers`)}
            style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.navy }}>
              {followerCount}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/followers/${userId}?type=following`)}
            style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.navy }}>
              {followingCount}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>following</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: Colors.navy }}>
              {cafesVisited}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
              Cafes Visited
            </Text>
          </View>
        </View>

        <ProfileTabs reviews={reviews} photos={photos} />
      </ScrollView>

      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}
