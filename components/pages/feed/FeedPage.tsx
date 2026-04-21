import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useProfile } from 'utils/ProfileContext';
import GridBackground from 'components/GridBackdrop';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';
import { FeedCard } from './FeedCard';

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
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '900',
            fontStyle: 'italic',
            color: Colors.navy,
          }}>
            SOCIAL FEED
          </Text>
        </View>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginBottom: 12,
          backgroundColor: '#fff',
          borderRadius: 100,
          borderWidth: 1,
          borderColor: '#000',
          overflow: 'hidden',
        }}>
          <TouchableOpacity
            onPress={() => setActiveTab('following')}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: activeTab === 'following' ? Colors.navy : '#fff',
            }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: activeTab === 'following' ? '#fff' : '#555',
            }}>
              following
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('global')}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: activeTab === 'global' ? Colors.navy : '#fff',
            }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: activeTab === 'global' ? '#fff' : '#555',
            }}>
              discover
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
          {loading ? (
            <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 40 }}>
              Loading...
            </Text>
          ) : feed.length === 0 ? (
            <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 40 }}>
              {activeTab === 'following' ? 'Follow someone to see their reviews!' : 'No reviews yet!'}
            </Text>
          ) : (
            feed.map((review) => (
              <FeedCard key={review.id} review={review} currentUserId={userId} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
  );
}