import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';
import BottomNav from 'components/BottomNav';
import GridBackground from 'components/GridBackdrop';
import { useProfile } from 'utils/ProfileContext';

export default function FollowersPage() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'followers' | 'following' }>();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useProfile();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      if (type === 'followers') {
        const { data } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', Number(id));
        if (data && data.length > 0) {
          const followerIds = data.map((r) => r.follower_id);
          const { data: userData } = await supabase
            .from('users')
            .select('id, username')
            .in('id', followerIds);
          if (userData) setUsers(userData);
        }
      } else {
        const { data } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', Number(id));
        if (data && data.length > 0) {
          const followingIds = data.map((r) => r.following_id);
          const { data: userData } = await supabase
            .from('users')
            .select('id, username')
            .in('id', followingIds);
          if (userData) setUsers(userData);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, type]);

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
      <View style={{ paddingHorizontal: 16, paddingTop: 100, paddingBottom: 16 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '900',
            fontStyle: 'italic',
            color: Colors.navy,
            textTransform: 'uppercase',
          }}>
          {type === 'followers' ? 'Followers' : 'Following'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}>
        {loading ? (
          <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 20 }}>
            Loading...
          </Text>
        ) : users.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 20 }}>
            {type === 'followers' ? 'No followers yet!' : 'Not following anyone yet!'}
          </Text>
        ) : (
          users.map((user) => (
            <TouchableOpacity
              key={user.id}
              activeOpacity={0.7}
              onPress={() => {
                console.log('tapped user:', user.id);
                if (String(user.id) === String(userId)) {
                  router.push('/profile');
                } else {
                  router.push(`/user/${user.id}`);
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#000',
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 10,
              }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#000',
                }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.navy }}>
                  {user.username?.[0]?.toUpperCase()}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontWeight: '700',
                  fontSize: 14,
                  color: Colors.navy,
                  marginLeft: 12,
                }}>
                {user.username}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 18 }}>→</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}
