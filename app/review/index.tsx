import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from 'utils/ProfileContext';
import { supabase } from 'utils/supabase';
import BottomNav from 'components/BottomNav';
import { Colors } from 'utils/colors';
import { getNearbyCafes } from 'utils/foursquare';
import * as FileSystem from 'expo-file-system/legacy';
import { DEFAULT_LAT, DEFAULT_LNG } from 'utils/constants';

const VIBES = ['Studying', 'Dessert', 'Date', 'To Go', 'Lounging', 'Socializing', 'Work'];

function StarRating({
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

export default function ReviewPage() {
  const router = useRouter();
  const { cafeId: prefilledCafeId, cafeName: prefilledCafeName } = useLocalSearchParams<{
    cafeId?: string;
    cafeName?: string;
  }>();
  const { userId } = useProfile();
  const [cafeName, setCafeName] = useState(prefilledCafeName ?? '');
  const [selectedCafeId, setSelectedCafeId] = useState(
    prefilledCafeName ? (prefilledCafeId ?? '') : ''
  );
  const [cafeSearchResults, setCafeSearchResults] = useState<any[]>([]);
  const [cafeSelected, setCafeSelected] = useState(!!prefilledCafeName);
  const [drinksRating, setDrinksRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [vibeRating, setVibeRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [itemName, setItemName] = useState('');

  // Search cafes as user types
  useEffect(() => {
    if (cafeSelected || !cafeName.trim()) {
      setCafeSearchResults([]);
      return;
    }
    const search = async () => {
      const results = await getNearbyCafes(DEFAULT_LAT, DEFAULT_LNG, 3200, cafeName);
      setCafeSearchResults(results.slice(0, 5));
    };
    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [cafeName, cafeSelected]);

  const selectCafe = (cafe: any) => {
    setCafeName(cafe.name);
    setSelectedCafeId(cafe.fsq_place_id);
    setCafeSelected(true);
    setCafeSearchResults([]);
  };

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const uri of photos) {
      const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const { data, error } = await supabase.storage
        .from('review-photos')
        .upload(fileName, byteArray, { contentType: 'image/jpeg' });
      if (error) {
        console.error('Upload error:', error);
      } else {
        const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
    }
    return uploadedUrls;
  };

  const updateCafeCoverPhoto = async (cafeId: string, photoUrl: string) => {
    const { data } = await supabase
      .from('cafes')
      .select('cover_photo')
      .eq('fsq_place_id', cafeId)
      .single();
    if (data?.cover_photo) return;
    await supabase
      .from('cafes')
      .upsert({ fsq_place_id: cafeId, cover_photo: photoUrl }, { onConflict: 'fsq_place_id' });
  };

  const handleSubmit = async () => {
    if (!userId || !cafeName) {
      alert('Please enter a cafe name!');
      return;
    }

    const uploadedPhotoUrls = await uploadPhotos();

    if (uploadedPhotoUrls.length > 0 && selectedCafeId) {
      await updateCafeCoverPhoto(selectedCafeId, uploadedPhotoUrls[0]);
    }

    const { error } = await supabase.from('reviews').insert({
      user_id: userId,
      cafe_id: selectedCafeId || cafeName.toLowerCase().replace(/\s/g, '_'),
      cafe_name: cafeName,
      item_name: itemName,
      drinks_rating: drinksRating,
      food_rating: foodRating,
      vibe_rating: vibeRating,
      service_rating: serviceRating,
      vibes: selectedVibes,
      comments: comments,
      photos: uploadedPhotoUrls,
    });

    if (error) {
      alert('Error submitting review: ' + error.message);
    } else {
      alert('Review submitted!');
      router.push('/home');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.blue }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.blue} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 10 }}>
          <Text
            style={{
              fontSize: 45,
              fontWeight: '900',
              fontStyle: 'italic',
              color: '#fff',
              textTransform: 'uppercase',
            }}>
            SIP & SCORE ☕
          </Text>
        </View>

        <View
          style={{
            backgroundColor: Colors.blue,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            padding: 24,
            minHeight: 600,
          }}>
          {/* Search bar */}
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 100,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: cafeSearchResults.length > 0 ? 0 : 30,
              }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              <TextInput
                value={cafeName}
                onChangeText={(text) => {
                  setCafeName(text);
                  setCafeSelected(false);
                  setSelectedCafeId('');
                }}
                placeholder="What cafe did you visit?"
                placeholderTextColor="#aaa"
                style={{ flex: 1, fontSize: 14, color: Colors.navy }}
              />
              {cafeSelected && (
                <TouchableOpacity
                  onPress={() => {
                    setCafeName('');
                    setCafeSelected(false);
                    setSelectedCafeId('');
                  }}>
                  <Text style={{ fontSize: 16, color: '#aaa' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {cafeSearchResults.length > 0 && (
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  marginBottom: 30,
                  overflow: 'hidden',
                }}>
                {cafeSearchResults.map((cafe, index) => (
                  <TouchableOpacity
                    key={cafe.fsq_place_id}
                    onPress={() => selectCafe(cafe)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: index < cafeSearchResults.length - 1 ? 1 : 0,
                      borderBottomColor: Colors.border,
                    }}>
                    <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.navy }}>
                      {cafe.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                      {cafe.location?.formatted_address}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Star ratings */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 5,
              marginBottom: 30,
              marginTop: 10,
              marginHorizontal: 25,
            }}>
            <StarRating label="DRINKS" rating={drinksRating} setRating={setDrinksRating} />
            <StarRating label="FOOD" rating={foodRating} setRating={setFoodRating} />
            <StarRating label="VIBE" rating={vibeRating} setRating={setVibeRating} />
            <StarRating label="SERVICE" rating={serviceRating} setRating={setServiceRating} />
          </View>

          {/* Item name */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: Colors.border,
              marginBottom: 20,
            }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🍵</Text>
            <TextInput
              value={itemName}
              onChangeText={setItemName}
              placeholder="What did you order?"
              placeholderTextColor="#aaa"
              style={{ flex: 1, fontSize: 14, color: Colors.navy }}
            />
          </View>

          {/* What's the move */}
          <View style={{ marginBottom: 20, marginHorizontal: 40, width: '70%' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 100,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginBottom: 12,
                backgroundColor: '#fff',
              }}>
              <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.navy, flex: 1 }}>
                {"WHAT'S THE MOVE?"}
              </Text>
              <Text style={{ fontSize: 16 }}>⬇️</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {VIBES.map((vibe) => (
                <TouchableOpacity
                  key={vibe}
                  onPress={() => toggleVibe(vibe)}
                  style={{
                    borderRadius: 100,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: Colors.navy,
                    backgroundColor: selectedVibes.includes(vibe) ? Colors.navy : '#fff',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: selectedVibes.includes(vibe) ? '#fff' : Colors.navy,
                      fontWeight: '500',
                    }}>
                    {vibe}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{
                  borderRadius: 100,
                  width: 36,
                  height: 36,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: 'red', fontSize: 20, fontWeight: '600' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 16,
              marginHorizontal: 30,
              marginBottom: 16,
            }}>
            <TextInput
              value={comments}
              onChangeText={setComments}
              placeholder="Anything comments about this visit?"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              style={{ fontSize: 14, color: Colors.navy, minHeight: 15 }}
            />
          </View>

          {/* Add photos */}
          <TouchableOpacity
            onPress={pickPhoto}
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 24,
              gap: 16,
            }}>
            {photos.length > 0 ? (
              <Image
                source={{ uri: photos[0] }}
                style={{ width: 80, height: 80, borderRadius: 12 }}
              />
            ) : (
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  backgroundColor: Colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 30 }}>📷</Text>
              </View>
            )}
            <View>
              <Text style={{ fontWeight: '700', fontSize: 15, color: Colors.navy }}>
                ADD YOUR PHOTOS!
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>
                We would love to see the vibe
              </Text>
            </View>
          </TouchableOpacity>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: Colors.red,
              borderRadius: 100,
              paddingVertical: 16,
              marginHorizontal: 70,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20, fontStyle: 'italic' }}>
              {"Let's Sip It"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav activeTab="add" backgroundColor={Colors.background} />
    </SafeAreaView>
  );
}
