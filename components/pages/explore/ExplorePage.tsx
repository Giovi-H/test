import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Animated,
  Keyboard,
  Dimensions,
} from 'react-native';
import MapView from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import GridBackground from 'components/GridBackdrop';
import { useProfile } from 'utils/ProfileContext';
import { supabase } from 'utils/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useSavedCafes } from 'utils/useSavedCafes';
import { useNearbyCafes } from 'utils/useNearbyCafes';
import { Colors } from 'utils/colors';
import type { Region } from 'react-native-maps';
import ExploreMapView from './MapView';
import SearchOverlay from './SearchOverlay';
import CafeList from './CafeList';
import UserResults from './UserResults';
import type { ViewMode } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type BottomSheetRef = React.ComponentRef<typeof BottomSheet>;

export default function ExplorePage() {
  const { userId } = useProfile();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const [selectedCafeCoverPhoto, setSelectedCafeCoverPhoto] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(filter ?? null);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<number[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCafe, setSelectedCafe] = useState<any>(null);
  const [selectedCafeRating, setSelectedCafeRating] = useState<number | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [committedLocation, setCommittedLocation] = useState('');
  const [searchCoords, setSearchCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const locationInputRef = useRef<TextInput>(null);
  const searchInputRef = useRef<TextInput>(null);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const mapAnim = useRef(new Animated.Value(0)).current;

  const { nearbyCafes, loadingCafes } = useNearbyCafes(activeFilter, false, userId, searchCoords);
  const { savedCafes, toggleSave } = useSavedCafes(userId);

  const snapPoints = useMemo(
    () => (viewMode === 'map' ? ['15%', '50%', '90%'] : ['90%']),
    [viewMode]
  );

  const toggleFollow = async (targetId: number) => {
    if (!userId) return;
    const isFollowing = followingIds.includes(targetId);
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetId);
      setFollowingIds(prev => prev.filter(id => id !== targetId));
    } else {
      await supabase.from('follows').insert({
        follower_id: Number(userId),
        following_id: targetId,
      });
      setFollowingIds(prev => [...prev, targetId]);
    }
  };

  useEffect(() => {
    if (!userId) return;
    const loadFollowing = async () => {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      if (data) setFollowingIds(data.map(r => r.following_id));
    };
    loadFollowing();
  }, [userId]);

  useEffect(() => {
    if (!search.trim()) {
      setUserResults([]);
      return;
    }
    const searchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
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

  const filteredCafes = (nearbyCafes ?? [])
    .filter(cafe =>
      activeFilter === 'saved' ? savedCafes.includes(cafe.fsq_place_id) : true
    )
    .filter(cafe =>
      search ? cafe.name.toLowerCase().includes(search.toLowerCase()) : true
    );

  const openOverlay = useCallback(() => {
    setOverlayVisible(true);
    Animated.spring(overlayAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start(() => searchInputRef.current?.focus());
  }, [overlayAnim]);

  const closeOverlay = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(overlayAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setOverlayVisible(false));
  }, [overlayAnim]);

  const commitLocation = useCallback(
    (lat: number, lon: number, displayName: string) => {
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
      mapAnim.setValue(0);
      setViewMode('map');
      closeOverlay();
      Animated.timing(mapAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        mapRef.current?.animateToRegion(region, 600);
        bottomSheetRef.current?.snapToIndex(0);
      }, 300);
    },
    [closeOverlay, mapAnim]
  );

  const handleSearchBarPress = useCallback(() => {
    commitLocation(40.7128, -74.006, 'NYC, NY');
  }, [commitLocation]);

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

  const handleSuggestionPress = useCallback(
    (suggestion: any) => {
      commitLocation(
        parseFloat(suggestion.lat),
        parseFloat(suggestion.lon),
        suggestion.display_name
      );
    },
    [commitLocation]
  );

  const handleCurrentLocation = useCallback(() => {
    commitLocation(40.7128, -74.006, 'Use Current Location');
  }, [commitLocation]);

  const handlePinPress = useCallback(async (cafe: any) => {
    if (!cafe.latitude || !cafe.longitude) return;
    setSelectedCafe(cafe);
    setSelectedCafeRating(null);
    mapRef.current?.animateToRegion(
      {
        latitude: cafe.latitude - 0.003,
        longitude: cafe.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      300
    );
    bottomSheetRef.current?.snapToIndex(0);

    const { data: cafeData } = await supabase
      .from('cafes')
      .select('cover_photo')
      .eq('fsq_place_id', cafe.fsq_place_id)
      .single();
    setSelectedCafeCoverPhoto(cafeData?.cover_photo ?? null);

    const { data } = await supabase
      .from('reviews')
      .select('drinks_rating, food_rating, vibe_rating, service_rating')
      .eq('cafe_id', cafe.fsq_place_id);

    if (data && data.length > 0) {
      const avg =
        data.reduce((sum, r) => {
          const ratings = [r.drinks_rating, r.food_rating, r.vibe_rating, r.service_rating].filter(
            v => v != null
          );
          return sum + ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
        }, 0) / data.length;
      setSelectedCafeRating(Math.round(avg * 10) / 10);
    }
  }, []);

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

  const toggleFilter = useCallback((f: string) => {
    setActiveFilter(prev => (prev === f ? null : f));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />

        {viewMode === 'map' && (
          <Animated.View style={{ flex: 1, opacity: mapAnim }}>
            <ExploreMapView
              mapRef={mapRef}
              bottomSheetRef={bottomSheetRef}
              mapRegion={mapRegion}
              snapPoints={snapPoints}
              nearbyCafes={nearbyCafes ?? []}
              committedLocation={committedLocation}
              selectedCafe={selectedCafe}
              onDismissMiniCard={() => setSelectedCafe(null)}
              selectedCafeCoverPhoto={selectedCafeCoverPhoto}
              selectedCafeRating={selectedCafeRating}
              onExitMap={exitMapView}
              onPinPress={handlePinPress}
              savedCafes={savedCafes}
              onToggleSave={toggleSave}
              search={search}
              onSearchChange={setSearch}
              onOpenOverlay={openOverlay}
            />
          </Animated.View>
        )}

        {viewMode === 'list' && (
          <>
            <GridBackground color1="#FFFFFF" color2={Colors.border} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ backgroundColor: 'transparent', flex: 1 }}
              contentContainerStyle={{ paddingBottom: 120 }}
            >
              <CafeList
                search={search}
                onSearchChange={setSearch}
                onOpenOverlay={handleSearchBarPress}
                committedLocation={committedLocation}
                activeFilter={activeFilter}
                onToggleFilter={toggleFilter}
                loadingCafes={loadingCafes}
                filteredCafes={filteredCafes}
                savedCafes={savedCafes}
                onToggleSave={toggleSave}
              />
              <UserResults
                userResults={userResults}
                followingIds={followingIds}
                onToggleFollow={toggleFollow}
              />
            </ScrollView>
          </>
        )}

        {overlayVisible && (
          <SearchOverlay
            overlayTranslateY={overlayTranslateY}
            onClose={closeOverlay}
            search={search}
            onSearchChange={setSearch}
            searchInputRef={searchInputRef}
            locationQuery={locationQuery}
            onLocationQueryChange={setLocationQuery}
            locationInputRef={locationInputRef}
            geocoding={geocoding}
            loadingSuggestions={loadingSuggestions}
            locationSuggestions={locationSuggestions}
            onLocationSearch={handleLocationSearch}
            onSuggestionPress={handleSuggestionPress}
            onCurrentLocation={handleCurrentLocation}
          />
        )}
    </SafeAreaView>
  );
}