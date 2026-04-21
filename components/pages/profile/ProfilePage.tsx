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
import { useFollowCounts } from 'utils/useFollowCounts';
import { useReviews } from 'utils/useReviews';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';
import { useRefresh } from 'utils/useRefresh';
import { FeedCard } from 'components/pages/feed/FeedCard';

export default function ProfilePage() {
  const router = useRouter();
  const { profileImage, userId } = useProfile();
  const [username, setUsername] = useState('');
  const [joinYear, setJoinYear] = useState('2025');
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [corkTab, setCorkTab] = useState<'menu' | 'reviews' | 'photos'>('menu');

  const loadUsername = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();
    if (data) {
      setUsername(data.username);
    }
  };

  const loadSuggestedUsers = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('users')
      .select('id, username, profile_image_url')
      .neq('id', Number(userId))
      .limit(4);
    console.log('suggested users data:', data);
    console.log('suggested users error:', error);
    if (data) setSuggestedUsers(data);
  };

  const { refreshing, refresh, refreshKey } = useRefresh(async () => {
    await loadUsername();
    await loadSuggestedUsers();
  });

  const { followerCount, followingCount } = useFollowCounts(userId, refreshKey);
  const { reviews, photos, cafesVisited } = useReviews(userId, refreshKey);

  useEffect(() => {
    if (!userId) return;
    loadUsername();
    loadSuggestedUsers();
  }, [userId]);

  const menuItems = [
    { id: 1, name: 'Coconut Mango Boom', cafe: 'HeyTea' },
    { id: 2, name: 'Mochi Pudding Milk Tea', cafe: 'Tea Leaf & Creamery' },
    { id: 3, name: 'Mango Yogurt Smoothie', cafe: "Twoha's" },
    { id: 4, name: 'Matcha Latte', cafe: 'Cafe 2by2' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <GridBackground color1="#F5F5F5" color2={Colors.border} />
        <StatusBar barStyle="dark-content" />

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
            <View style={{
              width: 110, height: 110, borderRadius: 55,
              overflow: 'hidden', borderWidth: 2, borderColor: '#000',
            }}>
              <Image source={profileImage} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
          </View>

          {/* Welcome Title */}
          <View style={{ alignItems: 'center', marginTop: 14, paddingHorizontal: 24 }}>
            <Text style={{
              fontSize: 26, fontWeight: '900', fontStyle: 'italic',
              textAlign: 'center', color: Colors.navy,
              fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', letterSpacing: 1,
            }}>
              WELCOME TO{'\n'}{`${username?.toUpperCase()}'S CAFE`}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginTop: 4, letterSpacing: 1 }}>
              EST {joinYear}
            </Text>
          </View>

          {/* Edit Profile button */}
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/profile/edit')}
              style={{ backgroundColor: Colors.blue, borderRadius: 100, paddingHorizontal: 28, paddingVertical: 9 }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Card */}
          <View style={{
            marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff',
            borderRadius: 16, borderWidth: 1, borderColor: '#ddd',
            flexDirection: 'row', paddingVertical: 16,
          }}>
            <TouchableOpacity
              onPress={() => router.push(`/followers/${userId}?type=followers`)}
              style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.navy }}>{followerCount}</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>Followers</Text>
            </TouchableOpacity>
            <View style={{ width: 1, backgroundColor: '#eee' }} />
            <TouchableOpacity
              onPress={() => router.push(`/followers/${userId}?type=following`)}
              style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.navy }}>{followingCount}</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>Following</Text>
            </TouchableOpacity>
            <View style={{ width: 1, backgroundColor: '#eee' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.navy }}>{cafesVisited}</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>Cafes Visited</Text>
            </View>
          </View>

          {/* Cafe Goers You May Know */}
          <View style={{
            marginHorizontal: 16, marginTop: 12, backgroundColor: '#fff',
            borderRadius: 16, borderWidth: 1, borderColor: '#ddd', padding: 16,
          }}>
            <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 12 }}>
              cafe goers you may know...
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {suggestedUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => router.push(`/user/${user.id}`)}
                  style={{ alignItems: 'center', gap: 4 }}>
                  <View style={{ position: 'relative' }}>
                    <View style={{
                      width: 60, height: 60, borderRadius: 30, overflow: 'hidden',
                      borderWidth: 2, borderColor: '#000', backgroundColor: Colors.border,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {user.profile_image_url ? (
                        <Image source={{ uri: user.profile_image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.navy }}>
                          {user.username?.[0]?.toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 18, height: 18, borderRadius: 9,
                      backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: '#fff',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>+</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: Colors.navy, fontWeight: '600' }}>{user.username}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cork Board Section */}
          <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 0 }}>
            <Image
              source={require('../../../assets/corkboard.png')}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ padding: 16, minHeight: 400 }}>

              {corkTab === 'menu' && (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{
                    flex: 1, backgroundColor: 'rgba(255,255,255,0.85)',
                    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#ddd',
                  }}>
                    <Text style={{ fontWeight: '800', fontSize: 13, color: Colors.navy, marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 }}>
                      {username?.toUpperCase()}'S MENU
                    </Text>
                    {menuItems.map((item, i) => (
                      <Text key={item.id} style={{ fontSize: 11, color: '#333', marginBottom: 4 }}>
                        {i + 1}. {item.name}{'\n'}
                        <Text style={{ textDecorationLine: 'underline', color: Colors.blue }}>({item.cafe})</Text>
                      </Text>
                    ))}
                  </View>

                  <View style={{ gap: 8, justifyContent: 'flex-start', minWidth: 110 }}>
                    <View style={{ borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' }}>
                      <Image
                        source={require('../../../assets/paper.png')}
                        style={{ position: 'absolute', width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <View style={{ padding: 10, alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.navy, textAlign: 'center' }}>CAFE SPECIALTY:</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.blue, marginTop: 2 }}>drinks</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => setCorkTab('reviews')}
                      style={{ backgroundColor: Colors.blue, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>reviews</Text>
                      <Text style={{ fontSize: 14 }}>✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setCorkTab('photos')}
                      style={{ backgroundColor: Colors.blue, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>photos</Text>
                      <Text style={{ fontSize: 14 }}>📷</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {corkTab === 'reviews' && (
                <View>
                  <TouchableOpacity onPress={() => setCorkTab('menu')} style={{ marginBottom: 12, alignSelf: 'flex-start' }}>
                    <Text style={{ color: Colors.navy, fontWeight: '700', fontSize: 13 }}>← back</Text>
                  </TouchableOpacity>
                  {reviews.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 20 }}>No reviews yet!</Text>
                  ) : (
                    reviews.map((review) => (
                      <FeedCard
                        key={review.id}
                        review={{ ...review, users: { username, profile_image_url: null } }}
                        currentUserId={userId}
                      />
                    ))
                  )}
                </View>
              )}

              {corkTab === 'photos' && (
                <View>
                  <TouchableOpacity onPress={() => setCorkTab('menu')} style={{ marginBottom: 12, alignSelf: 'flex-start' }}>
                    <Text style={{ color: Colors.navy, fontWeight: '700', fontSize: 13 }}>← back</Text>
                  </TouchableOpacity>
                  {photos.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 20 }}>No photos yet!</Text>
                  ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {photos.map((uri, index) => (
                        <Image
                          key={index}
                          source={{ uri }}
                          style={{ width: '48%', height: 160, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' }}
                          resizeMode="cover"
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}