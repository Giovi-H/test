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

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 10,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#000',
        height: 120,
      }}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row' }}
        onPress={() => router.push(`/cafe/${cafe.fsq_place_id}`)}>
        <View
          style={{
            width: 90,
            height: 90,
            alignSelf: 'center',
            marginLeft: 20,
            backgroundColor: Colors.border,
            borderColor: '#000',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: 4,
          }}>
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 30 }}>☕</Text>
          )}
        </View>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 10,
            justifyContent: 'center',
            paddingLeft: 20,
          }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: Colors.navy, letterSpacing: 0.2 }}>
            {cafe.name}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 6 }}>
            {cafe.location?.address}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textMuted }}>
            {cafe.location?.locality}, {cafe.location?.region}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.blue, marginTop: 4, fontWeight: '600' }}>
            {cafe.categories?.[0]?.name}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onToggleSave(cafe.fsq_place_id)}
        style={{ paddingTop: 10, paddingRight: 12 }}>
        <Text style={{ fontSize: 16 }}>{isSaved ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </View>
  );
}
