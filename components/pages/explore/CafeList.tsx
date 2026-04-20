import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Colors } from 'utils/colors';
import { FILTERS } from 'utils/constants';
import CafeCard from 'components/CafeCard';
import type { NearbyCafe } from './types';

type CafeListProps = {
  search: string;
  onSearchChange: (text: string) => void;
  onOpenOverlay: () => void;
  committedLocation: string;
  activeFilter: string | null;
  onToggleFilter: (filter: string) => void;
  loadingCafes: boolean;
  filteredCafes: NearbyCafe[];
  savedCafes: string[];
  onToggleSave: (cafeId: string) => void | Promise<void>;
};

export default function CafeList({
  search,
  onSearchChange,
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
      {/* Search bar + location chip */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 8,
      }}>
        <View style={styles.searchBarTouchable}>
          <Text style={{ marginRight: 6, fontSize: 13, color: '#aaa' }}>🔍</Text>
          <TextInput
            placeholder="search a cafe, friend etc."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={onSearchChange}
            onFocus={onOpenOverlay}
            style={{ flex: 1, fontSize: 13, color: '#333' }}
          />
        </View>
        <TouchableOpacity style={styles.locationChip} onPress={onOpenOverlay}>
          <Text style={{ fontSize: 12 }}>📍</Text>
          <Text style={styles.locationChipText}>
            {committedLocation || 'NYC, NY'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
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
            <Text style={{
              fontSize: 13,
              color: activeFilter === f ? '#fff' : '#555',
              fontWeight: activeFilter === f ? '600' : '400',
            }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Popular near you label + cafe cards */}
      <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
        <View style={{
          backgroundColor: Colors.blue,
          borderRadius: 100,
          paddingHorizontal: 18,
          paddingVertical: 9,
          alignSelf: 'flex-start',
          marginBottom: 16,
        }}>
          <Text style={{
            color: '#fff',
            fontWeight: '700',
            fontSize: 13,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            {activeFilter === 'saved' ? 'saved' : 'popular near you'}
          </Text>
        </View>

        {loadingCafes ? (
          <ActivityIndicator color={Colors.navy} style={{ marginTop: 20 }} />
        ) : filteredCafes.length === 0 ? (
          <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 20 }}>
            No cafés to show yet.
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