import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';
import { useProfile } from 'utils/ProfileContext';
import BottomNav from 'components/BottomNav';
import GridBackground from 'components/GridBackdrop';

type LeaderboardEntry = {
  id: number;
  username: string;
  profile_image_url: string | null;
  review_count: number;
};

export default function LeaderboardPage() {
  const router = useRouter();
  const { userId } = useProfile();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('user_id, users(id, username, profile_image_url)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Count reviews per user
      const counts: Record<number, LeaderboardEntry> = {};
      data?.forEach((r: any) => {
        const user = r.users;
        if (!user) return;
        if (!counts[user.id]) {
          counts[user.id] = {
            id: user.id,
            username: user.username,
            profile_image_url: user.profile_image_url,
            review_count: 0,
          };
        }
        counts[user.id].review_count += 1;
      });

      const sorted = Object.values(counts).sort((a, b) => b.review_count - a.review_count);
      setEntries(sorted);
      setLoading(false);
    };

    loadLeaderboard();
  }, []);

  const medalColor = (index: number) => {
    if (index === 0) return '#FFD700'; // gold
    if (index === 1) return '#C0C0C0'; // silver
    if (index === 2) return '#CD7F32'; // bronze
    return Colors.textMuted;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <GridBackground color1="#FFFFFF" color2={Colors.border} />
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '900',
              fontStyle: 'italic',
              color: Colors.navy,
            }}>
            LEADERBOARD
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 4 }}>
            Most Sip & Score reviews
          </Text>
        </View>

        {loading ? (
          <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 40 }}>
            Loading...
          </Text>
        ) : (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            {entries.map((entry, index) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() =>
                  router.push(
                    Number(entry.id) === Number(userId) ? '/profile' : `/user/${entry.id}`
                  )
                }
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: index < 3 ? medalColor(index) : '#000',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  gap: 12,
                }}>
                {/* Rank */}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '900',
                    color: medalColor(index),
                    width: 28,
                  }}>
                  #{index + 1}
                </Text>

                {/* Avatar */}
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
                    overflow: 'hidden',
                  }}>
                  {entry.profile_image_url ? (
                    <Image
                      source={{ uri: entry.profile_image_url }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.navy }}>
                      {entry.username?.[0]?.toUpperCase()}
                    </Text>
                  )}
                </View>

                {/* Username */}
                <Text
                  style={{
                    flex: 1,
                    fontWeight: '700',
                    fontSize: 14,
                    color: Colors.navy,
                  }}>
                  {entry.username}
                </Text>

                {/* Review count */}
                <View
                  style={{
                    backgroundColor: index < 3 ? medalColor(index) : Colors.border,
                    borderRadius: 100,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: index < 3 ? '#fff' : Colors.navy,
                    }}>
                    {entry.review_count} reviews
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab="leaderboard" />
    </SafeAreaView>
  );
}
