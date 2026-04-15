import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import GridBackground from 'components/GridBackdrop';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import BottomNav from 'components/BottomNav';
import { supabase } from 'utils/supabase';
import { useFollowCounts } from 'utils/useFollowCounts';
import { useReviews } from 'utils/useReviews';
import { Colors } from 'utils/colors';
import ProfileTabs from 'components/ProfileTabs';
import { useRefresh } from 'utils/useRefresh';

export default function UserPage() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const router = useRouter();
  const { userId } = useProfile();
  const [username, setUsername] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const loadUser = async () => {
    if (!id) return;
    const { data, error } = await supabase.from('users').select('username').eq('id', id).single();
    if (error) {
      console.error('Error loading user:', error.message);
      return;
    }
    if (data) setUsername(data.username);
  };

  const { refreshing, refresh, refreshKey } = useRefresh(async () => {
    await loadUser();
  });

  const { followerCount, followingCount } = useFollowCounts(id, refreshKey);
  const { reviews, photos, cafesVisited } = useReviews(id, refreshKey);

  useEffect(() => {
    loadUser();
  }, [id]);

  useEffect(() => {
    if (!id || !userId) return;
    const checkIsFollowing = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error.message);
        return;
      }
      setIsFollowing(!!data);
    };
    checkIsFollowing();
  }, [id, userId]);

  const toggleFollow = async () => {
    if (!userId) return;
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', id);
      setIsFollowing(false);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: Number(userId), following_id: Number(id) });
      setIsFollowing(true);
    }
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.blue} />
        }>
        {/* Profile Picture */}
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: '#000',
              backgroundColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 36, fontWeight: '700', color: Colors.navy }}>
              {username?.[0]?.toUpperCase()}
            </Text>
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

        {/* Follow button + Expertise */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 14 }}>
          <TouchableOpacity
            onPress={toggleFollow}
            style={{
              backgroundColor: isFollowing ? '#fff' : Colors.blue,
              borderRadius: 100,
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: Colors.blue,
            }}>
            <Text
              style={{
                color: isFollowing ? Colors.blue : '#fff',
                fontWeight: '600',
                fontSize: 13,
              }}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
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
            onPress={() => router.push(`/followers/${id}?type=followers`)}
            style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.navy }}>
              {followerCount}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/followers/${id}?type=following`)}
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

      <BottomNav activeTab={(from as any) ?? 'explore'} />
    </SafeAreaView>
  );
}
