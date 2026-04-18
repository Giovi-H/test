import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from 'utils/colors';
import { supabase } from 'utils/supabase';

type Props = {
  cafe: any;
  isSaved: boolean;
  onToggleSave: (cafeId: string) => void;
};

export default function CafeCard({ cafe, isSaved, onToggleSave }: Props) {
  const router = useRouter();
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    const loadCoverPhoto = async () => {
      const { data } = await supabase
        .from('cafes')
        .select('cover_photo')
        .eq('fsq_place_id', cafe.fsq_place_id)
        .single();
      if (data?.cover_photo) setCoverPhoto(data.cover_photo);
    };
    loadCoverPhoto();
  }, [cafe.fsq_place_id]);

  useEffect(() => {
    const loadRating = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('drinks_rating, food_rating, vibe_rating, service_rating')
        .eq('cafe_id', cafe.fsq_place_id);
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => {
          const ratings = [r.drinks_rating, r.food_rating, r.vibe_rating, r.service_rating]
            .filter((v) => v != null);
          return sum + (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length);
        }, 0) / data.length;
        setRating(Math.round(avg * 10) / 10);
      }
    };
    loadRating();
  }, [cafe.fsq_place_id]);

  const distanceMiles = cafe.distance != null
    ? `${(cafe.distance / 1609).toFixed(1)} mi`
    : null;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#000',
        overflow: 'hidden',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 100,
      }}
      onPress={() => router.push(`/cafe/${cafe.fsq_place_id}`)}>

      {/* Thumbnail */}
      <View style={{
        width: 95,
        height: 100,
        backgroundColor: Colors.border,
        borderColor: '#000',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 8,
        flexShrink: 0,
      }}>
        {coverPhoto ? (
          <Image
            source={{ uri: coverPhoto }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 24 }}>☕</Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.navy, letterSpacing: 0.3, textAlign: 'center' }}>
          {cafe.name.toUpperCase()}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center' }}>
          {cafe.location?.address}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center' }}>
          {cafe.location?.locality}, {cafe.location?.region}
        </Text>

        {/* Rating + Distance row */}
        <View style={{ flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {rating != null && (
            <Text style={{ fontSize: 11, color: Colors.blue, fontWeight: '600', textDecorationLine: 'underline' }}>
              Sip It Rating: {rating}
            </Text>
          )}
          {distanceMiles && (
            <View style={{
              backgroundColor: Colors.navy,
              borderRadius: 100,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}>
              <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>
                 {distanceMiles}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Save button */}
      <TouchableOpacity
        onPress={() => onToggleSave(cafe.fsq_place_id)}
        style={{ paddingBottom: 40 }}>
        <Text style={{ fontSize: 14 }}>{isSaved ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}