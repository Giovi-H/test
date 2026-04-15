import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import GridBackground from 'components/GridBackdrop';
import { useRouter } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import { supabase } from 'utils/supabase';
import BottomNav from 'components/BottomNav';
import { useLocalSearchParams } from 'expo-router';
import { useSavedCafes } from 'utils/useSavedCafes';
import { useNearbyCafes } from 'utils/useNearbyCafes';
import { FILTERS } from 'utils/constants';
import { Colors } from 'utils/colors';
import CafeCard from 'components/CafeCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ViewMode = 'list' | 'map';

type NearbyCafe = {
  fsq_place_id: string;
  name: string;
  location?: { address?: string; locality?: string } | null;
  distance?: number;
  latitude?: number;
  longitude?: number;
};

export default function ExplorePage() {
  const router = useRouter();
  const { userId } = useProfile();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const [selectedCafeCoverPhoto, setSelectedCafeCoverPhoto] = useState<string | null>(null);

  // Search + filter state
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(filter ?? null);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<number[]>([]);

  // Map state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCafe, setSelectedCafe] = useState<any>(null);
  const [selectedCafeRating, setSelectedCafeRating] = useState<number | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Location overlay state
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [committedLocation, setCommittedLocation] = useState('');
  const [searchCoords, setSearchCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Refs
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const locationInputRef = useRef<TextInput>(null);
  const searchInputRef = useRef<TextInput>(null);
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Data hooks
  const { nearbyCafes, loadingCafes } = useNearbyCafes(activeFilter, false, userId, searchCoords);
  const { savedCafes, toggleSave } = useSavedCafes(userId);

  const snapPoints = useMemo(() =>
    viewMode === 'map' ? ['15%', '50%', '90%'] : ['90%'],
    [viewMode]
  );

  // ── Follow logic ──────────────────────────────────────────────────────────
  const toggleFollow = async (targetId: number) => {
    if (!userId) return;
    const isFollowing = followingIds.includes(targetId);
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', userId).eq('following_id', targetId);
      setFollowingIds(prev => prev.filter(id => id !== targetId));
    } else {
      await supabase.from('follows').insert({
        follower_id: Number(userId), following_id: targetId,
      });
      setFollowingIds(prev => [...prev, targetId]);
    }
  };

  useEffect(() => {
    if (!userId) return;
    const loadFollowing = async () => {
      const { data } = await supabase.from('follows')
        .select('following_id').eq('follower_id', userId);
      if (data) setFollowingIds(data.map(r => r.following_id));
    };
    loadFollowing();
  }, [userId]);

  // ── User search ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) { setUserResults([]); return; }
    const searchUsers = async () => {
      const { data, error } = await supabase.from('users')
        .select('id, username')
        .ilike('username', `%${search}%`)
        .neq('id', Number(userId))
        .limit(10);
      if (data) setUserResults(data);
      if (error) console.error('Error searching users:', error);
    };
    const timeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // ── Location suggestions ──────────────────────────────────────────────────
  useEffect(() => {
    if (!locationQuery.trim() || locationQuery.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const encoded = encodeURIComponent(locationQuery);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&featuretype=city&countrycodes=us`,
          { headers: { 'User-Agent': 'Sipit/1.0' } }
        );
        const results = await res.json();
        setLocationSuggestions(results);
      } catch (e) {
        console.error('Suggestions error:', e);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [locationQuery]);

  const filteredCafes = nearbyCafes
    .filter(cafe => activeFilter === 'saved' ? savedCafes.includes(cafe.fsq_place_id) : true)
    .filter(cafe => search ? cafe.name.toLowerCase().includes(search.toLowerCase()) : true);

  // ── Overlay open/close ────────────────────────────────────────────────────
  const openOverlay = useCallback(() => {
    setOverlayVisible(true);
    Animated.spring(overlayAnim, {
      toValue: 1, useNativeDriver: true, tension: 65, friction: 10,
    }).start(() => searchInputRef.current?.focus());
  }, [overlayAnim]);

  const closeOverlay = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(overlayAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setOverlayVisible(false));
  }, [overlayAnim]);

  // ── Commit a location ─────────────────────────────────────────────────────
  const commitLocation = useCallback((lat: number, lon: number, displayName: string) => {
    const region: Region = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setSearchCoords({ lat, lng: lon });
    setMapRegion(region);
    setCommittedLocation(displayName.split(',')[0]);
    setLocationSuggestions([]);
    setLocationQuery(displayName.split(',')[0]);
    setViewMode('map');
    closeOverlay();
    setTimeout(() => {
      mapRef.current?.animateToRegion(region, 600);
      bottomSheetRef.current?.snapToIndex(0);
    }, 300);
  }, [closeOverlay]);

  // ── Geocode on submit ─────────────────────────────────────────────────────
  const handleLocationSearch = useCallback(async () => {
    if (!locationQuery.trim()) return;
    Keyboard.dismiss();
    setGeocoding(true);
    try {
      const encoded = encodeURIComponent(locationQuery);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=us`,
        { headers: { 'User-Agent': 'Sipit/1.0' } }
      );
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        commitLocation(parseFloat(lat), parseFloat(lon), display_name);
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    } finally {
      setGeocoding(false);
    }
  }, [locationQuery, commitLocation]);

  // ── Suggestion tap ────────────────────────────────────────────────────────
  const handleSuggestionPress = useCallback((suggestion: any) => {
    commitLocation(
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon),
      suggestion.display_name
    );
  }, [commitLocation]);

  // ── Current location ──────────────────────────────────────────────────────
  const handleCurrentLocation = useCallback(() => {
    commitLocation(40.7128, -74.006, 'Use Current Location');
  }, [commitLocation]);

  // ── Pin press ─────────────────────────────────────────────────────────────
  const handlePinPress = useCallback(async (cafe: any) => {
    console.log('Pin pressed:', cafe.name);
    if (!cafe.latitude || !cafe.longitude) return;
    setSelectedCafe(cafe);
    setSelectedCafeRating(null);
    mapRef.current?.animateToRegion({
      latitude: cafe.latitude - 0.003,
      longitude: cafe.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 300);
    bottomSheetRef.current?.snapToIndex(0);

    // Fetch cover photo
const { data: cafeData } = await supabase
.from('cafes')
.select('cover_photo')
.eq('fsq_place_id', cafe.fsq_place_id)
.single();
setSelectedCafeCoverPhoto(cafeData?.cover_photo ?? null);

    // Fetch average rating from Sipit reviews
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
      setSelectedCafeRating(Math.round(avg * 10) / 10);
    }
  }, []);

  // ── Exit map ──────────────────────────────────────────────────────────────
  const exitMapView = useCallback(() => {
    setViewMode('list');
    setSelectedCafe(null);
    setSelectedCafeRating(null);
    setCommittedLocation('');
    setLocationQuery('');
    setSearchCoords(null);
    setSelectedCafeCoverPhoto(null);
  }, []);

  const overlayTranslateY = overlayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />

      {/* ── MAP VIEW ── */}
      {viewMode === 'map' && (
        <>
          <MapView
            ref={mapRef}
            style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}
            provider={PROVIDER_DEFAULT}
            mapType="mutedStandard"
            initialRegion={mapRegion}
            showsUserLocation
            showsCompass={false}
            showsPointsOfInterest={false}
          >
            {nearbyCafes.filter(cafe => cafe.latitude && cafe.longitude).map(cafe => (
              <Marker
                key={cafe.fsq_place_id}
                coordinate={{
                  latitude: cafe.latitude!,
                  longitude: cafe.longitude!,
                }}
                onPress={() => handlePinPress(cafe)}
              >
                <View style={[
                  styles.pin,
                  selectedCafe?.fsq_place_id === cafe.fsq_place_id && styles.pinActive,
                ]}>
                  <Text style={styles.pinEmoji}>☕</Text>
                </View>
              </Marker>
            ))}
          </MapView>

          <View style={styles.mapTopBar}>
            <TouchableOpacity style={styles.backBtn} onPress={exitMapView}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.locationLabel}>
              <Text style={styles.locationLabelText} numberOfLines={1}>
                📍 {committedLocation}
              </Text>
            </View>
          </View>

          {/* ── Mini café card ── */}
          {selectedCafe && (
            <View style={styles.miniCard}>
    {/* X to dismiss */}
    <TouchableOpacity
      onPress={() => setSelectedCafe(null)}
      style={{ position: 'absolute', top: 10, right: 12, zIndex: 1 }}
    >
      <Text style={{ fontSize: 16, color: Colors.textMuted }}>✕</Text>
    </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{
  width: 80, height: 80,
  borderRadius: 10, overflow: 'hidden',
  backgroundColor: Colors.border,
  borderWidth: 1, borderColor: '#eee',
  alignItems: 'center', justifyContent: 'center',
}}>
  {selectedCafeCoverPhoto ? (
    <Image
      source={{ uri: selectedCafeCoverPhoto }}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    />
  ) : (
    <Text style={{ fontSize: 28 }}>☕</Text>
  )}
</View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.miniCardName} numberOfLines={1}>
                    {selectedCafe.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    {selectedCafeRating != null ? (
                      <>
                        <Text style={{ fontSize: 12, color: '#f5a623' }}>
                          {'★'.repeat(Math.round(selectedCafeRating))}
                          {'☆'.repeat(5 - Math.round(selectedCafeRating))}
                        </Text>
                        <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                          {selectedCafeRating} Sipit rating
                        </Text>
                      </>
                    ) : (
                      <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                        No Sipit reviews yet
                      </Text>
                    )}
                  </View>
                  <Text style={styles.miniCardSub} numberOfLines={1}>
                    {selectedCafe.location?.address ?? selectedCafe.location?.locality}
                  </Text>
                  <Text style={styles.miniCardDist}>
                    {selectedCafe.distance != null
                      ? `${(selectedCafe.distance / 1609).toFixed(1)} mi away`
                      : '—'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push(`/cafe/${selectedCafe.fsq_place_id}`)}
                style={{
                  marginTop: 12,
                  backgroundColor: Colors.navy,
                  borderRadius: 100,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Cafe Page</Text>
              </TouchableOpacity>
            </View>
          )}

          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            backgroundStyle={styles.sheetBg}
            handleIndicatorStyle={styles.sheetHandle}
          >
            <BottomSheetFlatList<NearbyCafe>
              data={nearbyCafes}
              keyExtractor={(item: NearbyCafe) => item.fsq_place_id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              ListHeaderComponent={
                <Text style={styles.sheetHeader}>
                  {nearbyCafes.length} cafés near {committedLocation}
                </Text>
              }
              renderItem={({ item }: { item: NearbyCafe }) => (
                <CafeCard
                  cafe={item}
                  isSaved={savedCafes.includes(item.fsq_place_id)}
                  onToggleSave={toggleSave}
                />
              )}
            />
          </BottomSheet>
        </>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <>
          <GridBackground color1="#FFFFFF" color2={Colors.border} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: 'transparent', flex: 1 }}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, paddingTop: 12, gap: 8,
            }}>
              <TouchableOpacity
                style={styles.searchBarTouchable}
                onPress={openOverlay}
                activeOpacity={0.85}
              >
                <Text style={{ marginRight: 6, fontSize: 13, color: '#aaa' }}>🔍</Text>
                <Text style={styles.searchBarPlaceholder}>
                  {search || 'search a cafe, friend etc.'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.locationChip} onPress={openOverlay}>
                <Text style={{ fontSize: 12 }}>📍</Text>
                <Text style={styles.locationChipText}>
                  {committedLocation || 'NYC, NY'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {FILTERS.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveFilter(activeFilter === f ? null : f)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 14, paddingVertical: 6,
                    borderRadius: 100, borderWidth: 1, borderColor: '#000',
                    backgroundColor: activeFilter === f ? Colors.navy : '#fff',
                    gap: 4,
                  }}>
                  {f === 'saved' && <Text style={{ fontSize: 11 }}>🤍</Text>}
                  {f === 'visited' && <Text style={{ fontSize: 11 }}>🔄</Text>}
                  <Text style={{
                    fontSize: 13,
                    color: activeFilter === f ? '#fff' : '#555',
                    fontWeight: activeFilter === f ? '600' : '400',
                  }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
              <View style={{
                backgroundColor: Colors.blue, borderRadius: 100,
                paddingHorizontal: 18, paddingVertical: 9,
                alignSelf: 'flex-start', marginBottom: 16,
              }}>
                <Text style={{
                  color: '#fff', fontWeight: '700', fontSize: 13,
                  letterSpacing: 0.5, textTransform: 'uppercase',
                }}>
                  {activeFilter === 'saved' ? 'saved' : 'popular near you'}
                </Text>
              </View>

              {loadingCafes ? (
                <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 20 }}>
                  Loading cafes...
                </Text>
              ) : (
                filteredCafes.map(cafe => (
                  <CafeCard
                    key={cafe.fsq_place_id}
                    cafe={cafe}
                    isSaved={savedCafes.includes(cafe.fsq_place_id)}
                    onToggleSave={toggleSave}
                  />
                ))
              )}
            </View>

            {userResults.length > 0 && (
              <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
                <View style={{
                  backgroundColor: Colors.red, borderRadius: 100,
                  paddingHorizontal: 18, paddingVertical: 9,
                  alignSelf: 'flex-start', marginBottom: 16,
                }}>
                  <Text style={{
                    color: '#fff', fontWeight: '700', fontSize: 13,
                    letterSpacing: 0.5, textTransform: 'uppercase',
                  }}>people</Text>
                </View>
                {userResults.map(user => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => router.push(`/user/${user.id}?from=explore`)}
                    style={{
                      backgroundColor: '#fff', borderRadius: 14, marginBottom: 10,
                      flexDirection: 'row', alignItems: 'center',
                      borderWidth: 1, borderColor: '#000',
                      paddingHorizontal: 16, paddingVertical: 12,
                    }}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: Colors.border, alignItems: 'center',
                      justifyContent: 'center', borderWidth: 1, borderColor: '#000',
                    }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.navy }}>
                        {user.username?.[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{
                      flex: 1, fontWeight: '700', fontSize: 14,
                      color: Colors.navy, marginLeft: 12,
                    }}>{user.username}</Text>
                    <TouchableOpacity
                      onPress={() => toggleFollow(user.id)}
                      style={{
                        backgroundColor: followingIds.includes(user.id) ? '#fff' : Colors.navy,
                        borderRadius: 100, paddingHorizontal: 16, paddingVertical: 6,
                        borderWidth: 1, borderColor: Colors.navy,
                      }}>
                      <Text style={{
                        color: followingIds.includes(user.id) ? Colors.navy : '#fff',
                        fontWeight: '600', fontSize: 12,
                      }}>
                        {followingIds.includes(user.id) ? 'following' : 'follow'}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      <BottomNav activeTab="explore" />

      {/* ── SEARCH OVERLAY ── */}
      {overlayVisible && (
        <Animated.View
          style={[styles.overlay, { transform: [{ translateY: overlayTranslateY }] }]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.overlayHeader}>
              <TouchableOpacity onPress={closeOverlay} style={styles.overlayBackBtn}>
                <Text style={styles.overlayBackText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.overlayTitle}>Search</Text>
            </View>

            {/* Search input — first */}
            <View style={styles.overlayInputGroup}>
              <Text style={styles.overlayInputLabel}>🔍 Search</Text>
              <View style={styles.overlayInputRow}>
                <TextInput
                  ref={searchInputRef}
                  style={styles.overlayInput}
                  placeholder="Search a café or friend..."
                  placeholderTextColor="#aaa"
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                  onSubmitEditing={closeOverlay}
                />
              </View>
            </View>

            <View style={styles.overlayDivider} />

            {/* Location input — second */}
            <View style={styles.overlayInputGroup}>
              <Text style={styles.overlayInputLabel}>📍 Location</Text>
              <View style={styles.overlayInputRow}>
                <TextInput
                  ref={locationInputRef}
                  style={styles.overlayInput}
                  placeholder="Enter a city or neighborhood..."
                  placeholderTextColor="#aaa"
                  value={locationQuery}
                  onChangeText={setLocationQuery}
                  returnKeyType="search"
                  onSubmitEditing={handleLocationSearch}
                  autoCapitalize="words"
                />
                {(geocoding || loadingSuggestions) && (
                  <ActivityIndicator size="small" color={Colors.navy} style={{ marginLeft: 8 }} />
                )}
              </View>
            </View>

            {/* Location suggestions dropdown */}
            {locationSuggestions.length > 0 && (
              <View style={{
                marginHorizontal: 16,
                backgroundColor: '#fff',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.border,
                overflow: 'hidden',
                marginBottom: 8,
              }}>
                <TouchableOpacity
                  onPress={handleCurrentLocation}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>📍</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.navy }}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>
                {locationSuggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSuggestionPress(s)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: i < locationSuggestions.length - 1 ? 1 : 0,
                      borderBottomColor: Colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' }}>
                      {s.display_name.split(',')[0]}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
                      {s.display_name.split(',').slice(1, 3).join(',')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.overlaySearchBtn}
              onPress={handleLocationSearch}
              disabled={geocoding}
            >
              {geocoding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.overlaySearchBtnText}>Show map →</Text>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBarTouchable: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: '#000',
  },
  searchBarPlaceholder: {
    flex: 1, fontSize: 13, color: '#aaa',
  },
  locationChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.navy, borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 9, gap: 5,
  },
  locationChipText: {
    color: '#fff', fontSize: 13, fontWeight: '600',
  },
  pin: {
    backgroundColor: '#fff', borderRadius: 20, padding: 6,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
    borderWidth: 1, borderColor: '#eee',
  },
  pinActive: {
    backgroundColor: Colors.navy,
    transform: [{ scale: 1.25 }],
  },
  pinEmoji: { fontSize: 16 },
  mapTopBar: {
    position: 'absolute', top: 56, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 10,
  },
  backBtn: {
    backgroundColor: '#fff', borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backBtnText: { fontWeight: '700', color: Colors.navy, fontSize: 13 },
  locationLabel: {
    flex: 1, backgroundColor: '#fff', borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  locationLabelText: { fontSize: 13, color: '#333', fontWeight: '500' },
  miniCard: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.18,
    left: 16, right: 16,
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16,
    shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 6, zIndex: 10,
    borderWidth: 1, borderColor: '#eee',
  },
  miniCardName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  miniCardSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  miniCardDist: { fontSize: 12, color: Colors.blue, marginTop: 4 },
  sheetBg: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  sheetHandle: { backgroundColor: '#ddd', width: 40 },
  sheetHeader: {
    fontSize: 13, color: Colors.textMuted, paddingVertical: 12,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', zIndex: 100,
  },
  overlayHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12,
  },
  overlayBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  overlayBackText: { fontSize: 14, color: '#333', fontWeight: '600' },
  overlayTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  overlayInputGroup: { paddingHorizontal: 16, paddingVertical: 12 },
  overlayInputLabel: {
    fontSize: 12, fontWeight: '600',
    color: Colors.textMuted, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  overlayInputRow: { flexDirection: 'row', alignItems: 'center' },
  overlayInput: {
    flex: 1, fontSize: 16, color: '#1a1a1a',
    borderBottomWidth: 1.5, borderBottomColor: Colors.navy,
    paddingVertical: 8,
  },
  overlayDivider: {
    height: 1, backgroundColor: Colors.border, marginHorizontal: 16,
  },
  overlaySearchBtn: {
    marginHorizontal: 16, marginTop: 24,
    backgroundColor: Colors.navy, borderRadius: 100,
    paddingVertical: 14, alignItems: 'center',
  },
  overlaySearchBtnText: {
    color: '#fff', fontSize: 15, fontWeight: '700',
  },
});