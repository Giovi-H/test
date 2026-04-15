import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from 'utils/colors';
import { FILTERS } from 'utils/constants';
import CafeCard from 'components/CafeCard';
import type { NearbyCafe } from './types';

type CafeListProps = {
  search: string;
  onOpenOverlay: () => void;
  committedLocation: string;
  activeFilter: string | null;
  onToggleFilter: (filter: string) => void;
  loadingCafes: boolean;
  filteredCafes: NearbyCafe[];
  savedCafes: string[];
  onToggleSave: (fsqPlaceId: string) => void;
};

export default function CafeList({
  search,
  onOpenOverlay,
  committedLocation,
  activeFilter,
  onToggleFilter,
  loadingCafes,
  filteredCafes,
  savedCafes,
  onToggleSave,
}: CafeListProps) {
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 12,
          gap: 8,
        }}
      >
        <TouchableOpacity
          style={styles.searchBarTouchable}
          onPress={onOpenOverlay}
          activeOpacity={0.85}
        >
          <Text style={{ marginRight: 6, fontSize: 13, color: '#aaa' }}>🔍</Text>
          <Text style={styles.searchBarPlaceholder}>
            {search || 'search a cafe, friend etc.'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationChip} onPress={onOpenOverlay}>
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
            onPress={() => onToggleFilter(f)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: '#000',
              backgroundColor: activeFilter === f ? Colors.navy : '#fff',
              gap: 4,
            }}
          >
            {f === 'saved' && <Text style={{ fontSize: 11 }}>🤍</Text>}
            {f === 'visited' && <Text style={{ fontSize: 11 }}>🔄</Text>}
            <Text
              style={{
                fontSize: 13,
                color: activeFilter === f ? '#fff' : '#555',
                fontWeight: activeFilter === f ? '600' : '400',
              }}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
        <View
          style={{
            backgroundColor: Colors.blue,
            borderRadius: 100,
            paddingHorizontal: 18,
            paddingVertical: 9,
            alignSelf: 'flex-start',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontWeight: '700',
              fontSize: 13,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
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
              onToggleSave={onToggleSave}
            />
          ))
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchBarTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#000',
  },
  searchBarPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#aaa',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 5,
  },
  locationChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
