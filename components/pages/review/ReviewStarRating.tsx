import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from 'utils/colors';

export function ReviewStarRating({
  label,
  rating,
  setRating,
  showPlus,
  expanded,
  onToggleExpand,
}: {
  label: string;
  rating: number;
  setRating: (r: number) => void;
  showPlus?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 100,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginBottom: 8,
      backgroundColor: '#fff',
    }}>
      <Text style={{ fontWeight: '700', fontSize: 12, color: Colors.navy, width: 70 }}>
        {label}:
      </Text>
      <View style={{ flexDirection: 'row', gap: 4, flex: 1 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={{ fontSize: 20 }}>{star <= rating ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {showPlus && (
        <TouchableOpacity
          onPress={onToggleExpand}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: Colors.red,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 20 }}>
            {expanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}