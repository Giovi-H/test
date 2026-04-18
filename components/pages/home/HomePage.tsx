import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import GridBackground from 'components/GridBackdrop';
import { useRouter } from 'expo-router';
import { useProfile } from 'utils/ProfileContext';
import BottomNav from 'components/BottomNav';
import { useSavedCafes } from 'utils/useSavedCafes';
import { useNearbyCafes } from 'utils/useNearbyCafes';
import { Colors } from 'utils/colors';
import CafeCard from 'components/CafeCard';

const { width } = Dimensions.get('window');

const CAFE_OF_THE_DAY = {
  name: 'CAFE 2BY2',
  image: require('../../../assets/snorlax.png'),
};

export default function HomePage() {
  const router = useRouter();
  const { userId } = useProfile();
  const scrollRef = useRef<ScrollView>(null);

  const { savedCafes, toggleSave } = useSavedCafes(userId);
  const { nearbyCafes, loadingCafes } = useNearbyCafes(null, true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <GridBackground color1="#F5F5F5" color2={Colors.border} />
      <StatusBar barStyle="dark-content" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Hero Image */}
        <View style={{ marginHorizontal: 40, marginTop: 12, height: 320, backgroundColor: '#ddd', position: 'relative', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#000' }}>
          <Image
            source={CAFE_OF_THE_DAY.image}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* "LET'S SIP IT" bubble sticker */}
          <View style={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: '#D6E8F5',
            borderRadius: 60,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: '#000',
            alignItems: 'center',
            maxWidth: 110,
          }}>
            <Text style={{ fontWeight: '900', fontSize: 13, color: '#1a1a1a', textAlign: 'center', letterSpacing: 0.5 }}>
              LET'S{'\n'}SIP IT
            </Text>
            <Text style={{ fontSize: 10, color: '#555', textAlign: 'center', marginTop: 2 }}>
              rate a cafe
            </Text>
          </View>

          {/* "this cafe matches your vibe!" sticker */}
          <View style={{
            position: 'absolute',
            bottom: 48,
            right: 12,
            backgroundColor: '#E8342A',
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: '#000',
            alignItems: 'center',
            maxWidth: 90,
            transform: [{ rotate: '5deg' }],
          }}>
            <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700', textAlign: 'center' }}>
              this cafe{'\n'}matches{'\n'}your vibe!
            </Text>
          </View>

          {/* Cafe name pill */}
          <View style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            backgroundColor: '#fff',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#000',
          }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.navy, letterSpacing: 0.3 }}>
              {CAFE_OF_THE_DAY.name}
            </Text>
          </View>
        </View>

        {/* Popular Near You */}
        <View style={{ paddingHorizontal: 30, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.blue,
              borderRadius: 100,
              paddingHorizontal: 18,
              paddingVertical: 10,
              alignSelf: 'flex-start',
              marginBottom: 16,
            }}
            onPress={() => router.push('/explore')}
          >
            <Text style={{
              color: '#fff',
              fontWeight: '700',
              fontSize: 13,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              popular near you
            </Text>
          </TouchableOpacity>

          {loadingCafes ? (
            <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 20 }}>
              Loading cafes...
            </Text>
          ) : (
            nearbyCafes.slice(0, 5).map((cafe) => (
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