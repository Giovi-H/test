import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import RNMapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { Colors } from 'utils/colors';
import CafeCard from 'components/CafeCard';
import type { NearbyCafe } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type BottomSheetRef = React.ComponentRef<typeof BottomSheet>;

type MapViewProps = {
  mapRef: React.RefObject<RNMapView | null>;
  bottomSheetRef: React.RefObject<BottomSheetRef | null>;
  mapRegion: Region;
  snapPoints: (string | number)[];
  nearbyCafes: NearbyCafe[];
  committedLocation: string;
  selectedCafe: NearbyCafe | null;
  onDismissMiniCard: () => void;
  selectedCafeCoverPhoto: string | null;
  selectedCafeRating: number | null;
  onExitMap: () => void;
  onPinPress: (cafe: NearbyCafe) => void;
  savedCafes: string[];
  onToggleSave: (fsqPlaceId: string) => void;
  search: string;
  onSearchChange: (text: string) => void;
  onOpenOverlay: () => void;
};

export default function MapView({
  mapRef,
  bottomSheetRef,
  mapRegion,
  snapPoints,
  nearbyCafes,
  committedLocation,
  selectedCafe,
  onDismissMiniCard,
  selectedCafeCoverPhoto,
  selectedCafeRating,
  onExitMap,
  onPinPress,
  savedCafes,
  onToggleSave,
  search,
  onSearchChange,
  onOpenOverlay,
}: MapViewProps) {
  const router = useRouter();

  return (
    <>
      <RNMapView
        ref={mapRef}
        style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}
        provider={PROVIDER_DEFAULT}
        mapType="mutedStandard"
        initialRegion={mapRegion}
        showsUserLocation
        showsCompass={false}
        showsPointsOfInterest={false}
      >
        {nearbyCafes
          .filter(cafe => cafe.latitude && cafe.longitude)
          .map(cafe => (
            <Marker
              key={cafe.fsq_place_id}
              coordinate={{
                latitude: cafe.latitude!,
                longitude: cafe.longitude!,
              }}
              onPress={() => onPinPress(cafe)}
            >
              <View style={[
                styles.pin,
                selectedCafe?.fsq_place_id === cafe.fsq_place_id && styles.pinActive,
              ]}>
                <Text style={styles.pinEmoji}>☕</Text>
              </View>
            </Marker>
          ))}
      </RNMapView>

      {/* Top bar */}
      <View style={{
        position: 'absolute',
        top: 56,
        left: 16,
        right: 16,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}>
        <TouchableOpacity style={styles.backBtn} onPress={onExitMap}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenOverlay}
          activeOpacity={0.85}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 100,
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderWidth: 1,
            borderColor: '#000',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}>
          <Text style={{ marginRight: 6, fontSize: 13, color: '#aaa' }}>🔍</Text>
          <Text style={{ flex: 1, fontSize: 13, color: search ? '#333' : '#aaa' }}>
            {search || 'search a cafe...'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenOverlay}
          style={{
            backgroundColor: Colors.navy,
            borderRadius: 100,
            paddingHorizontal: 14,
            paddingVertical: 9,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 16 }}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Mini card */}
      {selectedCafe && (
        <View style={styles.miniCard}>
          <TouchableOpacity
            onPress={onDismissMiniCard}
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
              onToggleSave={onToggleSave}
            />
          )}
        />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  pin: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pinActive: {
    backgroundColor: Colors.navy,
    transform: [{ scale: 1.25 }],
  },
  pinEmoji: { fontSize: 16 },
  backBtn: {
    backgroundColor: '#fff',
    borderRadius: 100,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#000',
  },
  backBtnText: { fontWeight: '700', color: Colors.navy, fontSize: 16 },
  miniCard: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.18,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  miniCardName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  miniCardSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  miniCardDist: { fontSize: 12, color: Colors.blue, marginTop: 4 },
  sheetBg: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: { backgroundColor: '#ddd', width: 40 },
  sheetHeader: {
    fontSize: 13,
    color: Colors.textMuted,
    paddingVertical: 12,
  },
});