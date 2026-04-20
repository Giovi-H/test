import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';

function StarDisplay({ count }: { count: number }) {
  if (!count || count === 0)
    return <Text style={{ fontSize: 12, color: Colors.textMuted }}>N/A</Text>;
  return (
    <Text style={{ fontSize: 13 }}>
      {Array.from({ length: 5 })
        .map((_, i) => (i < count ? '★' : '☆'))
        .join('')}
    </Text>
  );
}

export function FeedCard({
  review,
  currentUserId,
}: {
  review: any;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [cafeAddress, setCafeAddress] = useState<string | null>(null);
  const [sipItRating, setSipItRating] = useState<number | null>(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Fetch cover photo + address from cafes table
      const { data: cafeData } = await supabase
        .from('cafes')
        .select('cover_photo, address')
        .eq('fsq_place_id', review.cafe_id)
        .single();
      if (cafeData?.cover_photo) setCoverPhoto(cafeData.cover_photo);
      if (cafeData?.address) setCafeAddress(cafeData.address);

      // Fetch avg Sip It rating
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('drinks_rating, food_rating, vibe_rating, service_rating')
        .eq('cafe_id', review.cafe_id);
      if (reviewData && reviewData.length > 0) {
        const avg = reviewData.reduce((sum, r) => {
          const ratings = [r.drinks_rating, r.food_rating, r.vibe_rating, r.service_rating]
            .filter((v) => v != null);
          return sum + (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length);
        }, 0) / reviewData.length;
        setSipItRating(Math.round(avg * 10) / 10);
      }
    };
    load();
  }, [review.cafe_id]);

  const formattedDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
      })
    : null;

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 20 }}>

      {/* Username row */}
      <TouchableOpacity
        onPress={() => {
          if (String(review.user_id) === String(currentUserId)) {
            router.push('/profile');
          } else {
            router.push(`/user/${review.user_id}?from=feed`);
          }
        }}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 }}>
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          overflow: 'hidden',
          borderWidth: 1.5,
          borderColor: '#000',
          backgroundColor: Colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {review.users?.profile_image_url ? (
            <Image
              source={{ uri: review.users.profile_image_url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontWeight: '700', fontSize: 16, color: Colors.navy }}>
              {review.users?.username?.[0]?.toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 100,
          paddingHorizontal: 16,
          paddingVertical: 7,
          borderWidth: 1,
          borderColor: '#000',
        }}>
          <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.navy }}>
            {review.users?.username?.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Main card */}
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#000',
        overflow: 'hidden',
        padding: 12,
      }}>

        {/* Posted date */}
        {formattedDate && (
          <Text style={{
            fontSize: 12,
            color: Colors.textMuted,
            marginBottom: 10,
            textAlign: 'right',
          }}>
            Posted on {formattedDate}
          </Text>
        )}

        {/* Content row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>

          {/* Left: photo + cafe info */}
          <TouchableOpacity
            onPress={() => router.push(`/cafe/${review.cafe_id}`)}
            style={{ width: '42%' }}>
            <View style={{
              borderRadius: 10,
              overflow: 'hidden',
              height: 130,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: '#000',
              backgroundColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {coverPhoto ? (
                <Image
                  source={{ uri: coverPhoto }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 32 }}>☕</Text>
              )}
            </View>
            <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.navy, marginBottom: 2 }}>
              {review.cafe_name}
            </Text>
            {cafeAddress && (
              <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 2 }}>
                {cafeAddress}
              </Text>
            )}
            {sipItRating != null && (
              <Text style={{
                fontSize: 11, color: Colors.blue,
                fontWeight: '600', textDecorationLine: 'underline',
              }}>
                Sip It Rating: {sipItRating}
              </Text>
            )}
          </TouchableOpacity>

          {/* Right: ratings + notes */}
          <View style={{ flex: 1, gap: 6 }}>
            {[
              { label: 'DRINKS:', value: review.drinks_rating },
              { label: 'FOOD:', value: review.food_rating },
              { label: 'VIBE:', value: review.vibe_rating },
              { label: 'SERVICE:', value: review.service_rating },
            ].map((item) => (
              <View key={item.label} style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 100,
                paddingHorizontal: 8,
                paddingVertical: 4,
                justifyContent: 'space-between',
              }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.navy }}>
                  {item.label}
                </Text>
                <StarDisplay count={item.value} />
              </View>
            ))}

            {review.vibes?.length > 0 && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 100,
                paddingHorizontal: 8,
                paddingVertical: 4,
                justifyContent: 'space-between',
              }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.navy }}>
                  {"WHAT'S THE MOVE?"}
                </Text>
                <Text style={{ fontSize: 10, color: Colors.blue, fontWeight: '600' }}>
                  {review.vibes[0]}
                </Text>
              </View>
            )}

            {/* Notes */}
            {review.comments ? (
              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.navy, marginBottom: 2 }}>
                  notes:
                </Text>
                <Text style={{ fontSize: 11, color: '#555', lineHeight: 16 }}>
                  {review.comments}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Likes row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 }}>
          <TouchableOpacity onPress={() => {
            setLiked(!liked);
            setLikes(liked ? likes - 1 : likes + 1);
          }}>
            <Text style={{ fontSize: 18 }}>{liked ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.navy }}>{likes}</Text>
        </View>
      </View>
    </View>
  );
}