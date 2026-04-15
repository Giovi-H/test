import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from 'utils/colors';

export function ReviewStarRating({
  label,
  rating,
  setRating,
}: {
  label: string;
  rating: number;
  setRating: (r: number) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 100,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 10,
        backgroundColor: '#fff',
      }}>
      <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.navy, width: 80 }}>
        {label}:
      </Text>
      <View style={{ flexDirection: 'row', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={{ fontSize: 22 }}>{star <= rating ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
