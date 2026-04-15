import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from 'utils/colors';

type UserRow = { id: number; username: string | null };

type UserResultsProps = {
  userResults: UserRow[];
  followingIds: number[];
  onToggleFollow: (userId: number) => void;
};

export default function UserResults({
  userResults,
  followingIds,
  onToggleFollow,
}: UserResultsProps) {
  const router = useRouter();

  if (userResults.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
      <View
        style={{
          backgroundColor: Colors.red,
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
          people
        </Text>
      </View>
      {userResults.map(user => (
        <TouchableOpacity
          key={user.id}
          onPress={() => router.push(`/user/${user.id}?from=explore`)}
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#000',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#000',
            }}
          >
            <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.navy }}>
              {user.username?.[0]?.toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              flex: 1,
              fontWeight: '700',
              fontSize: 14,
              color: Colors.navy,
              marginLeft: 12,
            }}
          >
            {user.username}
          </Text>
          <TouchableOpacity
            onPress={() => onToggleFollow(user.id)}
            style={{
              backgroundColor: followingIds.includes(user.id) ? '#fff' : Colors.navy,
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: Colors.navy,
            }}
          >
            <Text
              style={{
                color: followingIds.includes(user.id) ? Colors.navy : '#fff',
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              {followingIds.includes(user.id) ? 'following' : 'follow'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
}
