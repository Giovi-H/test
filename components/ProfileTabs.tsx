import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from 'utils/colors';
import { supabase } from 'utils/supabase';

type Props = {
  reviews: any[];
  photos: string[];
};

function StarDisplay({ count }: { count: number }) {
  if (!count || count === 0) return <Text style={{ fontSize: 11, color: Colors.textMuted }}>N/A</Text>;
  return (
    <Text style={{ fontSize: 11 }}>
      {Array.from({ length: 5 }).map((_, i) => (i < count ? '⭐' : '☆')).join('')}
    </Text>
  );
}

function ReviewCard({ review }: { review: any }) {
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
    <TouchableOpacity
      onPress={() => router.push(`/cafe/${review.cafe_id}`)}
      style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#000', flexDirection: 'row', overflow: 'hidden', marginBottom: 12 }}>

      {/* Left side - photo */}
      <View style={{ width: '35%', padding: 8 }}>
        <View style={{ borderRadius: 10, overflow: 'hidden', height: 90, marginBottom: 6, borderWidth: 1, borderColor: '#000', backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
          ) : (
            <Text style={{ fontSize: 24 }}>☕</Text>
          )}
        </View>
        <Text style={{ fontWeight: '700', fontSize: 11, color: Colors.navy }} numberOfLines={2}>{review.cafe_name}</Text>
      </View>

      {/* Right side - ratings */}
      <View style={{ flex: 1, padding: 8 }}>
        {[
          { label: 'DRINKS:', value: review.drinks_rating },
          { label: 'FOOD:', value: review.food_rating },
          { label: 'VIBE:', value: review.vibe_rating },
          { label: 'SERVICE:', value: review.service_rating },
        ].map((item) => (
          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 100, paddingHorizontal: 6, paddingVertical: 3, marginBottom: 4, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.navy }}>{item.label}</Text>
            <StarDisplay count={item.value} />
          </View>
        ))}
        {review.vibes?.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 100, paddingHorizontal: 6, paddingVertical: 3, marginBottom: 4, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.navy }}>MOVE:</Text>
            <Text style={{ fontSize: 10, color: Colors.blue, fontWeight: '600' }}>{review.vibes[0]}</Text>
          </View>
        )}
        {review.comments ? (
          <Text style={{ fontSize: 10, color: '#555', marginTop: 2 }} numberOfLines={2}>{review.comments}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileTabs({ reviews, photos }: Props) {
  const [activeTab, setActiveTab] = useState('reviews');
  const router = useRouter();

  return (
    <>
      {/* Tabs */}
      <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row' }}>
        {['reviews', 'menu', 'photos'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: activeTab === tab ? 2 : 0, borderBottomColor: Colors.navy }}>
            <Text style={{ fontWeight: activeTab === tab ? '700' : '400', fontSize: 14, color: Colors.navy, textTransform: 'capitalize' }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        {activeTab === 'reviews' && (
          reviews.length === 0 ? (
            <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 20 }}>No reviews yet!</Text>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )
        )}

        {activeTab === 'photos' && (
          photos.length === 0 ? (
            <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 20 }}>No photos yet!</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {photos.map((uri, index) => (
                <Image key={index} source={{ uri }} style={{ width: '48.5%', height: 160, borderRadius: 10, borderWidth: 1, borderColor: Colors.border }} resizeMode='cover' />
              ))}
            </View>
          )
        )}
      </View>

      {activeTab === 'menu' && (
        reviews.filter((r) => r.item_name).length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 20 }}>No menu items yet!</Text>
        ) : (
          reviews.filter((r) => r.item_name).map((review) => (
            <TouchableOpacity
              key={review.id}
              onPress={() => router.push(`/cafe/${review.cafe_id}`)}
              style={{ backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10, marginHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 16 }}>⭐</Text>
                <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.navy }}>{review.item_name}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <Text style={{ fontSize: 14, color: Colors.red }}>📍</Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted }}>{review.cafe_name}</Text>
              </View>
            </TouchableOpacity>
          ))
        )
      )}
    </>
  );
}