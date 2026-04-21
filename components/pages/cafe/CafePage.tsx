import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import BottomNav from 'components/BottomNav';
import { getCafeDetails } from 'utils/foursquare';
import { supabase } from 'utils/supabase';
import { Colors } from 'utils/colors';
import { FeedCard } from 'components/pages/feed/FeedCard';
import GridBackground from 'components/GridBackdrop';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function CafePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useProfile();
  const [activeTab, setActiveTab] = useState('menu');
  const [saved, setSaved] = useState(false);
  const [cafe, setCafe] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

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
      .select('*, users(username, profile_image_url)')
      .eq('cafe_id', id)
      .order('created_at', { ascending: false });
    if (data) {
      setReviews(data);
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => {
          const ratings = [r.drinks_rating, r.food_rating, r.vibe_rating, r.service_rating]
            .filter((v) => v != null);
          return sum + (ratings.length > 0
            ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
            : 0);
        }, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    }
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' }}>
        <GridBackground color1={Colors.blue} color2="#4b5a9c" />
        <Text style={{ color: '#fff' }}>Loading cafe...</Text>
      </SafeAreaView>
    );
  }

  if (!cafe) return null;

  const cafeName = cafe.name ?? '';
  const cafeCategory = cafe.categories?.map((c: any) => c.name).join(' • ') ?? '';
  const cafeAddress = cafe.location?.formatted_address ?? '';
  const reviewCount = reviews.length;
  const galleryPhotos = reviews.flatMap((r) => r.photos ?? []);
  const vibes = [...new Set(reviews.flatMap((r) => r.vibes ?? []))];
  const coverPhoto = reviews
    .slice()
    .reverse()
    .find((r) => r.photos && r.photos.length > 0)?.photos[0] ?? null;

  const allMenuItems = reviews
    .filter((r) => r.item_name)
    .map((r) => r.item_name)
    .reduce((acc: { name: string; count: number }[], item: string) => {
      const existing = acc.find((i) => i.name.toLowerCase() === item.toLowerCase());
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: item, count: 1 });
      }
      return acc;
    }, [])
    .sort((a: { name: string; count: number }, b: { name: string; count: number }) => b.count - a.count);

  const popularMenuItems = allMenuItems.slice(0, 4);
  const menuTabItems = allMenuItems.slice(0, 10);

  const topVibes = [...new Set(reviews.flatMap((r) => r.vibes ?? []))]
  .map((vibe) => ({
    name: vibe,
    count: reviews.filter((r) => r.vibes?.includes(vibe)).length,
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 3)
  .map((v) => v.name);

  const openMaps = () => {
    const query = encodeURIComponent(`${cafeName} ${cafeAddress}`);
    const url = Platform.OS === 'ios' ? `maps://?q=${query}` : `geo:0,0?q=${query}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else Linking.openURL(`https://maps.google.com/maps?q=${query}`);
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) =>
      i < Math.round(rating) ? '★' : '☆'
    ).join('');
  };

  return (
    <View style={{ flex: 1 }}>
      <GridBackground color1={Colors.blue} color2="#4b5a9c" />
      <StatusBar barStyle="light-content" />
  
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
  
        {/* Hero Image */}
        <View style={{ height: 260 + insets.top, position: 'relative', backgroundColor: Colors.blue, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', marginBottom: -5, zIndex: 1 }}>          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: '100%', height: '100%', backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 60 }}>☕</Text>
            </View>
          )}
  
          <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute', top: insets.top + 8, left: 16,
            backgroundColor: Colors.red,
            borderRadius: 100, width: 36, height: 36,
            alignItems: 'center', justifyContent: 'center', zIndex: 20,
          }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>

        {/* Heart — outside hero too */}
        <TouchableOpacity
          onPress={toggleSave}
          style={{ position: 'absolute', top: insets.top + 220, right: 16, zIndex: 20 }}>
          <Text style={{ fontSize: 24 }}>{saved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
  
          <View style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
            <Text style={{ color: '#fff', fontSize: 12, marginBottom: 2, opacity: 0.85 }}>
              {cafeCategory}
            </Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>
              {cafeName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {avgRating != null && (
                <Text style={{ color: '#f5a623', fontSize: 14 }}>{renderStars(avgRating)}</Text>
              )}
              {avgRating != null && (
                <View style={{ backgroundColor: Colors.blue, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{avgRating}</Text>
                </View>
              )}
              <Text style={{ color: '#fff', fontSize: 12 }}>({reviewCount} Sip It Reviews)</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveTab('gallery')} style={{ marginTop: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12, textDecorationLine: 'underline' }}>
                Check out the vibe ({galleryPhotos.length} photos)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Box 1 — Action buttons + popular items + best for */}
        <View style={{ backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginHorizontal: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, zIndex: 0 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.push(`/review?cafeId=${id}&cafeName=${cafe.name}`)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blue, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, gap: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>+</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Sip & Score</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openMaps}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blue, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, gap: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>📍</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blue, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, gap: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>🕐</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Hours</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blue, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, gap: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>📞</Text>
            </TouchableOpacity>
          </View>
  
          <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.navy, marginBottom: 10, textAlign: 'center', letterSpacing: 0.5 }}>
            MOST POPULAR MENU ITEMS
          </Text>
          <View style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 14, marginBottom: 16 }}>
            {popularMenuItems.length === 0 ? (
              <Text style={{ color: Colors.textMuted, textAlign: 'center', fontSize: 13 }}>
                No menu items yet — add a review!
              </Text>
            ) : (
              popularMenuItems.map((item: { name: string; count: number }, index: number) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: '#f5a623' }}>★</Text>
                  <Text style={{ fontSize: 13, color: Colors.navy, fontWeight: '500' }}>{item.name}</Text>
                </View>
              ))
            )}
          </View>
  
          <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.navy, marginBottom: 10, letterSpacing: 0.5 }}>
            BEST FOR
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {topVibes.length === 0 ? (
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>No vibes yet!</Text>
            ) : (
              topVibes.map((tag: string) => (
                <View key={tag} style={{ borderWidth: 1, borderColor: Colors.navy, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, color: Colors.navy }}>{tag}</Text>
                </View>
              ))
            )}
          </View>
        </View>
  
        {/* Box 2 — Tabs + content */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, margin: 16, padding: 16, borderWidth: 1, borderColor: Colors.border }}>
          <View style={{ backgroundColor: Colors.blue, borderRadius: 16, flexDirection: 'row', marginBottom: 16 }}>
            {['menu', 'reviews', 'gallery'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: activeTab === tab ? '#fff' : 'transparent', borderRadius: 12, margin: 4 }}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: activeTab === tab ? Colors.blue : '#fff', textTransform: 'capitalize' }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
  
          {activeTab === 'menu' && (
            <View style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 14 }}>
              {menuTabItems.length === 0 ? (
                <Text style={{ color: Colors.textMuted, textAlign: 'center', fontSize: 13 }}>No menu items yet!</Text>
              ) : (
                menuTabItems.map((item: { name: string; count: number }, index: number) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: '#f5a623' }}>★</Text>
                    <Text style={{ fontSize: 13, color: Colors.navy, fontWeight: '500' }}>{item.name}</Text>
                  </View>
                ))
              )}
            </View>
          )}
  
          {activeTab === 'reviews' && (
            reviews.length === 0 ? (
              <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 10 }}>
                No reviews yet — be the first to Sip & Score!
              </Text>
            ) : (
              reviews.map((review) => (
                <FeedCard key={review.id} review={review} currentUserId={userId} />
              ))
            )
          )}
  
          {activeTab === 'gallery' && (
            galleryPhotos.length === 0 ? (
              <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 10, fontWeight: '700' }}>
                Be the first to add a photo!
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {galleryPhotos.map((uri: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{ width: '48.5%', height: 160, borderRadius: 10, borderWidth: 1, borderColor: Colors.border }}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )
          )}
        </View>
  
      </ScrollView>
      <SafeAreaView edges={['bottom']}>
        <BottomNav activeTab="explore" />
      </SafeAreaView>
    </View>
  );
}
