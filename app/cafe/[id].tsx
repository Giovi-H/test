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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import BottomNav from 'components/BottomNav';
import { getCafeDetails } from 'utils/foursquare';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';
import { Linking, Platform } from 'react-native';

export default function CafeProfilePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useProfile();
  const [activeTab, setActiveTab] = useState('menu');
  const [saved, setSaved] = useState(false);
  const [cafe, setCafe] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCafe = async () => {
    if (!id) return;
    const data = await getCafeDetails(id);
    setCafe(data);
    setLoading(false);
  };

  const loadReviews = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('reviews')
      .select('*, users(username)')
      .eq('cafe_id', id)
      .order('created_at', { ascending: true }); // oldest first for cover photo
    if (data) setReviews(data);
  };

  const checkSaved = async () => {
    if (!userId || !id) return;
    const { data } = await supabase
      .from('saved_cafes')
      .select('id')
      .eq('user_id', userId)
      .eq('cafe_id', id)
      .single();
    setSaved(!!data);
  };

  const toggleSave = async () => {
    if (!userId || !id) return;
    if (saved) {
      await supabase.from('saved_cafes').delete().eq('user_id', userId).eq('cafe_id', id);
      setSaved(false);
    } else {
      await supabase.from('saved_cafes').insert({ user_id: Number(userId), cafe_id: id });
      setSaved(true);
    }
  };

  useEffect(() => {
    loadCafe();
    loadReviews();
    checkSaved();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: Colors.textMuted }}>Loading cafe...</Text>
      </SafeAreaView>
    );
  }

  if (!cafe) return null;

  // Build display values from Foursquare data
  const cafeName = cafe.name ?? '';
  const cafeCategory = cafe.categories?.map((c: any) => c.name).join(' • ') ?? '';
  const cafeAddress = cafe.location?.formatted_address ?? '';
  const reviewCount = reviews.length;
  const menuItems = reviews
    .filter((r) => r.item_name)
    .map((r) => r.item_name)
    .filter((v, i, a) => a.indexOf(v) === i); // unique items
  const galleryPhotos = reviews.flatMap((r) => r.photos ?? []);
  const vibes = [...new Set(reviews.flatMap((r) => r.vibes ?? []))];
  const coverPhoto = reviews.find((r) => r.photos && r.photos.length > 0)?.photos[0] ?? null;
  const displayReviews = [...reviews].reverse(); // newest first for display

  const openMaps = () => {
    const name = cafe.name;
    const address = cafe.location?.formatted_address;
    if (!address) return;
    
    const query = encodeURIComponent(`${name} ${address}`);
    const url = Platform.OS === 'ios'
        ? `maps://?q=${query}`
        : `geo:0,0?q=${query}`;

    Linking.canOpenURL(url).then((supported) => {
        if (supported) {
            Linking.openURL(url);
        } else {
            Linking.openURL(`https://maps.google.com/maps?q=${query}`);
        }
    });
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Image */}
        <View style={{ height: 220, position: 'relative', backgroundColor: Colors.navy }}>
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: Colors.navy,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 60 }}>☕</Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: 50,
              left: 16,
              backgroundColor: Colors.red,
              borderRadius: 100,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
          </TouchableOpacity>

          {/* Heart button */}
          <TouchableOpacity
            onPress={toggleSave}
            style={{ position: 'absolute', top: 50, right: 16, zIndex: 10 }}>
            <Text style={{ fontSize: 24 }}>{saved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>

          {/* Cafe name overlay */}
          <View style={{ position: 'absolute', bottom: 40, left: 16 }}>
            <Text style={{ color: '#fff', fontSize: 13, marginBottom: 4 }}>{cafeCategory}</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>{cafeName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <View
                style={{
                  backgroundColor: Colors.blue,
                  borderRadius: 100,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Sip It</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 12 }}>({reviewCount} Sip It Reviews)</Text>
            </View>
            <TouchableOpacity style={{ marginTop: 6 }}>
              <Text style={{ color: '#fff', fontSize: 12, textDecorationLine: 'underline' }}>
                Check out the vibe ({galleryPhotos.length} photos)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info section */}
        <View style={{ backgroundColor: '#fff', padding: 16 }}>
          {/* Address */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View
              style={{
                backgroundColor: '#E8F5E9',
                borderRadius: 100,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}>
              <Text style={{ color: '#2E7D32', fontSize: 13, fontWeight: '600' }}>
                📍 {cafeAddress}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <TouchableOpacity
              onPress={() => router.push(`/review?cafeId=${id}&cafeName=${cafe.name}`)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.red,
                borderRadius: 100,
                paddingHorizontal: 14,
                paddingVertical: 8,
                gap: 4,
              }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>+</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Sip & Score</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openMaps}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.red,
                borderRadius: 100,
                paddingHorizontal: 14,
                paddingVertical: 8,
                gap: 4,
              }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>📍</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Map</Text>
            </TouchableOpacity>
            {cafe.website && (
            <TouchableOpacity
            onPress={() => {
            if (cafe.website) {
                Linking.openURL(cafe.website);
            }
        }}
        disabled={!cafe.website}
        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cafe.website ? Colors.red : Colors.textMuted, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, gap: 4 }}>
        <Text style={{ color: '#fff', fontSize: 12 }}>🌐</Text>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Website</Text>
    </TouchableOpacity>
)}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.red,
                borderRadius: 100,
                paddingHorizontal: 14,
                paddingVertical: 8,
                gap: 4,
              }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>🕐</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Hours</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.red,
                borderRadius: 100,
                paddingHorizontal: 14,
                paddingVertical: 8,
                gap: 4,
              }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>📞</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Call</Text>
            </TouchableOpacity>
          </View>

          {/* Most Popular Menu Items from reviews */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: Colors.navy,
              marginBottom: 10,
              textAlign: 'center',
            }}>
            MOST POPULAR MENU ITEMS
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 16,
              padding: 14,
              marginBottom: 20,
            }}>
            {menuItems.length === 0 ? (
              <Text style={{ color: Colors.textMuted, textAlign: 'center', fontSize: 13 }}>
                No menu items yet — add a review!
              </Text>
            ) : (
              menuItems.map((item, index) => (
                <View
                  key={index}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 14 }}>⭐</Text>
                  <Text style={{ fontSize: 13, color: Colors.navy, fontWeight: '500' }}>
                    {item}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Best For — from vibes in reviews */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.navy, marginBottom: 10 }}>
            BEST FOR
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {vibes.length === 0 ? (
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>No vibes yet!</Text>
            ) : (
              vibes.map((tag: string) => (
                <View
                  key={tag}
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.navy,
                    borderRadius: 100,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                  }}>
                  <Text style={{ fontSize: 13, color: Colors.navy }}>{tag}</Text>
                </View>
              ))
            )}
          </View>

          {/* Tabs */}
          <View
            style={{
              backgroundColor: Colors.blue,
              borderRadius: 16,
              flexDirection: 'row',
              marginBottom: 16,
            }}>
            {['menu', 'reviews', 'gallery'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center',
                  backgroundColor: activeTab === tab ? '#fff' : 'transparent',
                  borderRadius: 12,
                  margin: 4,
                }}>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 13,
                    color: activeTab === tab ? Colors.blue : '#fff',
                    textTransform: 'capitalize',
                  }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Gallery tab */}
          {activeTab === 'gallery' &&
            (galleryPhotos.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#1a1a1a', marginTop: 10, fontWeight: '900' }}>
                Be The First to Add a Photo!(First Photo Will Be Used as Cover Photo)
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {galleryPhotos.map((uri: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{
                      width: '48.5%',
                      height: 160,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </View>
            ))}

          {/* Menu tab */}
          {activeTab === 'menu' && (
            <View
              style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 14 }}>
              {menuItems.length === 0 ? (
                <Text style={{ color: Colors.textMuted, textAlign: 'center', fontSize: 13 }}>
                  No menu items yet!
                </Text>
              ) : (
                menuItems.map((item, index) => (
                  <View
                    key={index}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontSize: 14 }}>⭐</Text>
                    <Text style={{ fontSize: 13, color: Colors.navy, fontWeight: '500' }}>
                      {item}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Reviews tab */}
          {activeTab === 'reviews' &&
            (displayReviews.length === 0 ? (
              <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 10 }}>
                No reviews yet — be the first to Sip & Score!
              </Text>
            ) : (
              reviews.map((review) => (
                <View
                  key={review.id}
                  style={{
                    backgroundColor: Colors.background,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      fontWeight: '700',
                      fontSize: 13,
                      color: Colors.navy,
                      marginBottom: 4,
                    }}>
                    {review.users?.username?.toUpperCase()}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                      🍹 {review.drinks_rating ?? 'N/A'}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                      🍔 {review.food_rating ?? 'N/A'}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                      ✨ {review.vibe_rating ?? 'N/A'}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                      🤝 {review.service_rating ?? 'N/A'}
                    </Text>
                  </View>
                  {review.comments ? (
                    <Text style={{ fontSize: 12, color: '#555', marginTop: 6 }}>
                      {review.comments}
                    </Text>
                  ) : null}
                </View>
              ))
            ))}
        </View>
      </ScrollView>

      <BottomNav activeTab="explore" />
    </SafeAreaView>
  );
}
