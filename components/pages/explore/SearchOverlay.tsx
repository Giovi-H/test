import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Colors } from 'utils/colors';

type SearchOverlayProps = {
  overlayTranslateY: Animated.AnimatedInterpolation<string | number>;
  onClose: () => void;
  search: string;
  onSearchChange: (text: string) => void;
  searchInputRef: React.RefObject<TextInput | null>;
  locationQuery: string;
  onLocationQueryChange: (text: string) => void;
  locationInputRef: React.RefObject<TextInput | null>;
  geocoding: boolean;
  loadingSuggestions: boolean;
  locationSuggestions: { display_name: string; lat: string; lon: string }[];
  onLocationSearch: () => void;
  onSuggestionPress: (suggestion: {
    display_name: string;
    lat: string;
    lon: string;
  }) => void;
  onCurrentLocation: () => void;
};

export default function SearchOverlay({
  overlayTranslateY,
  onClose,
  search,
  onSearchChange,
  searchInputRef,
  locationQuery,
  onLocationQueryChange,
  locationInputRef,
  geocoding,
  loadingSuggestions,
  locationSuggestions,
  onLocationSearch,
  onSuggestionPress,
  onCurrentLocation,
}: SearchOverlayProps) {
  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateY: overlayTranslateY }] }]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.overlayHeader}>
          <TouchableOpacity onPress={onClose} style={styles.overlayBackBtn}>
            <Text style={styles.overlayBackText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.overlayTitle}>Search</Text>
        </View>

        <View style={styles.overlayInputGroup}>
          <Text style={styles.overlayInputLabel}>🔍 Search</Text>
          <View style={styles.overlayInputRow}>
            <TextInput
              ref={searchInputRef}
              style={styles.overlayInput}
              placeholder="Search a café or friend..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={onSearchChange}
              returnKeyType="search"
              onSubmitEditing={onClose}
            />
          </View>
        </View>

        <View style={styles.overlayDivider} />

        <View style={styles.overlayInputGroup}>
          <Text style={styles.overlayInputLabel}>📍 Location</Text>
          <View style={styles.overlayInputRow}>
            <TextInput
              ref={locationInputRef}
              style={styles.overlayInput}
              placeholder="Enter a city or neighborhood..."
              placeholderTextColor="#aaa"
              value={locationQuery}
              onChangeText={onLocationQueryChange}
              returnKeyType="search"
              onSubmitEditing={onLocationSearch}
              autoCapitalize="words"
            />
            {(geocoding || loadingSuggestions) && (
              <ActivityIndicator size="small" color={Colors.navy} style={{ marginLeft: 8 }} />
            )}
          </View>
        </View>

        {locationSuggestions.length > 0 && (
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: '#fff',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.border,
              overflow: 'hidden',
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={onCurrentLocation}
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
                onPress={() => onSuggestionPress(s)}
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
          onPress={onLocationSearch}
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
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  overlayBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayBackText: { fontSize: 14, color: '#333', fontWeight: '600' },
  overlayTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  overlayInputGroup: { paddingHorizontal: 16, paddingVertical: 12 },
  overlayInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overlayInputRow: { flexDirection: 'row', alignItems: 'center' },
  overlayInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.navy,
    paddingVertical: 8,
  },
  overlayDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  overlaySearchBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Colors.navy,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  overlaySearchBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
