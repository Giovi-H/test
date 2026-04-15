import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import GridBackground from 'components/GridBackdrop';
import BottomNav from 'components/BottomNav';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';

function StarDisplay({ count }: { count: number }) {
  if (!count || count === 0)
    return <Text style={{ fontSize: 12, color: Colors.textMuted }}>N/A</Text>;
  return (
    <Text style={{ fontSize: 12 }}>
      {Array.from({ length: 5 }).map((_, i) => (i < count ? '⭐' : '☆')).join('')}
    </Text>
  );
}

function FeedCard({ review, currentUserId }: { review: any; currentUserId: string | null }) {
  const router = useRouter();
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('cafes')
        .select('cover_photo')
        .eq('fsq_place_id', review.cafe_id)
        .single();
      if (data?.cover_photo) setCoverPhoto(data.cover_photo);
    };
    load();
  }, [review.cafe_id]);

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
      {/* Username */}
      <TouchableOpacity
        onPress={() => {
          if (String(review.user_id) === String(currentUserId)) {
            router.push('/profile');
          } else {
            router.push(`/user/${review.user_id}?from=feed`);
          }
        }}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#000', backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
          {review.users?.profile_image_url ? (
            <Image source={{ uri: review.users.profile_image_url }} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
          ) : (
            <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.navy }}>
              {review.users?.username?.[0]?.toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#000' }}>
          <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.navy }}>
            {review.users?.username?.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Card */}
      <TouchableOpacity
        onPress={() => router.push(`/cafe/${review.cafe_id}`)}
        style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#000', flexDirection: 'row', overflow: 'hidden' }}>
        {/* Left side */}
        <View style={{ width: '45%', padding: 10 }}>
          <View style={{ borderRadius: 10, overflow: 'hidden', height: 110, marginBottom: 8, borderWidth: 1, borderColor: '#000', backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
            {coverPhoto ? (
              <Image source={{ uri: coverPhoto }} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
            ) : (
              <Text style={{ fontSize: 32 }}>☕</Text>
            )}
          </View>
          <Text style={{ fontWeight: '700', fontSize: 12, color: Colors.navy }}>{review.cafe_name}</Text>
          <Text style={{ fontSize: 11, color: Colors.blue, marginTop: 4, fontWeight: '600' }}>Sip It Review</Text>
        </View>

        {/* Right side */}
        <View style={{ flex: 1, padding: 10 }}>
          {[
            { label: 'DRINKS:', value: review.drinks_rating },
            { label: 'FOOD:', value: review.food_rating },
            { label: 'VIBE:', value: review.vibe_rating },
            { label: 'SERVICE:', value: review.service_rating },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6, justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.navy }}>{item.label}</Text>
              <StarDisplay count={item.value} />
            </View>
          ))}
          {review.vibes?.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8, justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.navy }}>{"WHAT'S THE MOVE?"}</Text>
              <Text style={{ fontSize: 10, color: Colors.blue, fontWeight: '600' }}>{review.vibes[0]}</Text>
            </View>
          )}
          {review.comments ? (
            <>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.navy, marginBottom: 4 }}>notes:</Text>
              <Text style={{ fontSize: 11, color: '#555', lineHeight: 16 }}>{review.comments}</Text>
            </>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function FeedPage() {
  const { userId } = useProfile();
  const [activeTab, setActiveTab] = useState<'following' | 'global'>('following');
  const [followingFeed, setFollowingFeed] = useState<any[]>([]);
  const [globalFeed, setGlobalFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFollowingFeed = async () => {
    if (!userId) return;
    setLoading(true);
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (!follows || follows.length === 0) {
      setFollowingFeed([]);
      setLoading(false);
      return;
    }

    const followingIds = follows.map((f) => f.following_id);
    const { data } = await supabase
      .from('reviews')
      .select('*, users(username, profile_image_url)')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(30);

    if (data) setFollowingFeed(data);
    setLoading(false);
  };

  const loadGlobalFeed = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, users(username, profile_image_url)')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setGlobalFeed(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    loadFollowingFeed();
    loadGlobalFeed();
  }, [userId]);

  const feed = activeTab === 'following' ? followingFeed : globalFeed;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <GridBackground color1={Colors.background} color2={Colors.border} />
      <StatusBar barStyle='dark-content' backgroundColor={Colors.background} />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', fontStyle: 'italic', color: Colors.navy }}>SOCIAL FEED</Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 100, borderWidth: 1, borderColor: '#000', overflow: 'hidden' }}>
        <TouchableOpacity
          onPress={() => setActiveTab('following')}
          style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: activeTab === 'following' ? Colors.navy : '#fff' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: activeTab === 'following' ? '#fff' : '#555' }}>following</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('global')}
          style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: activeTab === 'global' ? Colors.navy : '#fff' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: activeTab === 'global' ? '#fff' : '#555' }}>discover</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        {loading ? (
          <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 40 }}>Loading...</Text>
        ) : feed.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 40 }}>
            {activeTab === 'following' ? 'Follow someone to see their reviews!' : 'No reviews yet!'}
          </Text>
        ) : (
          feed.map((review) => <FeedCard key={review.id} review={review} currentUserId={userId} />)
        )}
      </ScrollView>

      <BottomNav activeTab='feed' />
    </SafeAreaView>
  );
}