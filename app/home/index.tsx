import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import GridBackground from 'components/GridBackdrop';
import { useRouter } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import BottomNav from 'components/BottomNav';
import { useSavedCafes } from 'utils/useSavedCafes';
import { useNearbyCafes } from 'utils/useNearbyCafes';
import { FILTERS } from 'utils/constants';
import { Colors } from 'utils/colors';
import CafeCard from 'components/CafeCard';

const CAFE_OF_THE_DAY = {
  name: 'THE SNORLAX CAFE',
  image: require('../../assets/snorlax.png'),
};

export default function HomePage() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { userId } = useProfile();
  const scrollRef = useRef<ScrollView>(null);
  const exploreRef = useRef<View>(null);

  const { savedCafes, toggleSave } = useSavedCafes(userId);
  const { nearbyCafes, loadingCafes } = useNearbyCafes(null, true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <GridBackground color1="#FFFFFF" color2={Colors.border} />
      <StatusBar barStyle="dark-content" backgroundColor="#F2F0EA" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Search and Location */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            gap: 8,
          }}>
          <View
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
            }}>
            <Text style={{ marginRight: 6, fontSize: 13, color: '#aaa' }}>🔍</Text>
            <TextInput
              placeholder="search a cafe, friend etc."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
              onFocus={() => router.push('/explore')}
              style={{ flex: 1, fontSize: 13, color: '#333' }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.navy,
              borderRadius: 100,
              paddingHorizontal: 14,
              paddingVertical: 9,
              gap: 5,
            }}>
            <Text style={{ fontSize: 12 }}>📍</Text>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>NYC, NY</Text>
          </View>
        </View>

        {/* Filter Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => router.push(`/explore?filter=${filter}`)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: '#000',
                backgroundColor: '#fff',
                gap: 4,
              }}>
              {filter === 'saved' && <Text style={{ fontSize: 11 }}>🤍</Text>}
              {filter === 'visited' && <Text style={{ fontSize: 11 }}>🔄</Text>}
              <Text style={{ fontSize: 13, color: '#555', fontWeight: '400' }}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cafe of the Day */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Image
            source={require('../../assets/CafeOfDay.png')}
            style={{ width: '100%', height: 80, marginBottom: 12 }}
            resizeMode="contain"
          />
          <View
            style={{
              borderRadius: 18,
              overflow: 'hidden',
              height: 320,
              width: '85%',
              alignSelf: 'center',
              backgroundColor: '#ddd',
              borderWidth: 1,
              borderColor: '#000',
            }}>
            <Image
              source={CAFE_OF_THE_DAY.image}
              style={{ width: '70%', height: '100%' }}
              resizeMode="cover"
            />
            <View
              style={{
                position: 'absolute',
                bottom: 1,
                left: 1,
                backgroundColor: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: '#000',
              }}>
              <Text
                style={{ fontWeight: '700', fontSize: 14, color: Colors.navy, letterSpacing: 0.3 }}>
                {CAFE_OF_THE_DAY.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Popular Near You */}
        <View ref={exploreRef} style={{ paddingHorizontal: 16, marginTop: 22 }}>
          <View
            style={{
              backgroundColor: Colors.blue,
              borderRadius: 100,
              paddingHorizontal: 18,
              paddingVertical: 9,
              alignSelf: 'flex-start',
              marginBottom: 24,
            }}>
            <Text
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: 13,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}>
              popular near you
            </Text>
          </View>

          {loadingCafes ? (
            <Text style={{ color: Colors.textMuted, textAlign: 'center' }}>Loading cafes...</Text>
          ) : (
            nearbyCafes
              .slice(0, 3)
              .map((cafe) => (
                <CafeCard
                  key={cafe.fsq_place_id}
                  cafe={cafe}
                  isSaved={savedCafes.includes(cafe.fsq_place_id)}
                  onToggleSave={toggleSave}
                />
              ))
          )}
        </View>
      </ScrollView>

      <BottomNav activeTab="home" />
    </SafeAreaView>
  );
}
