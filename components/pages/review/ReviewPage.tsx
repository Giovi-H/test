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
import { ReviewStarRating } from './ReviewStarRating';
import GridBackground from 'components/GridBackdrop';
import CupLogo from 'components/pages/intro/StartHere/svgs/CupLogo';

const VIBES = ['Studying', 'Dessert', 'Date', 'To Go', 'Lounging', 'Socializing', 'Work'];

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
  const [drinksExpanded, setDrinksExpanded] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState<number | null>(null);
  const [originalDate, setOriginalDate] = useState<string | null>(null);
  const [updatedDate, setUpdatedDate] = useState<string | null>(null);

  // Check for existing review when cafe is selected
  useEffect(() => {
    if (!userId || !prefilledCafeId) return;
    const checkExisting = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('cafe_id', prefilledCafeId)
        .single();

      if (data) {
        setExistingReviewId(data.id);
        setDrinksRating(data.drinks_rating ?? 0);
        setFoodRating(data.food_rating ?? 0);
        setVibeRating(data.vibe_rating ?? 0);
        setServiceRating(data.service_rating ?? 0);
        setSelectedVibes(data.vibes ?? []);
        setComments(data.comments ?? '');
        setItemName(data.item_name ?? '');
        if (data.item_name) setDrinksExpanded(true);
        if (data.created_at) {
          setOriginalDate(new Date(data.created_at).toLocaleDateString('en-US', {
            month: 'numeric', day: 'numeric', year: '2-digit'
          }));
        }
        if (data.updated_at) {
          setUpdatedDate(new Date(data.updated_at).toLocaleDateString('en-US', {
            month: 'numeric', day: 'numeric', year: '2-digit'
          }));
        }
      }
    };
    checkExisting();
  }, [userId, prefilledCafeId]);

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
      if (uri.startsWith('http')) {
        uploadedUrls.push(uri);
        continue;
      }
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

    const reviewData = {
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
      updated_at: new Date().toISOString(),
    };

    let error;

    if (existingReviewId) {
      // Update existing review
      const { error: updateError } = await supabase
        .from('reviews')
        .update(reviewData)
        .eq('id', existingReviewId);
      error = updateError;
    } else {
      // Insert new review
      const { error: insertError } = await supabase
        .from('reviews')
        .insert(reviewData);
      error = insertError;
    }

    if (error) {
      alert('Error submitting review: ' + error.message);
    } else {
      alert(existingReviewId ? 'Review updated!' : 'Review submitted!');
      router.push('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.blue }}>
      <GridBackground color1={Colors.blue} color2="#4b5a9c" />
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 40,
          paddingBottom: 16,
          gap: 12,
        }}>
          <Text style={{
            fontSize: 36,
            fontWeight: '900',
            fontStyle: 'italic',
            color: '#fff',
            textTransform: 'uppercase',
            flex: 1,
          }}>
            SIP &{'\n'}SCORE
          </Text>
          <CupLogo />
        </View>

        {/* Existing review notice */}
        {existingReviewId && (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 12,
            padding: 12,
            marginHorizontal: 16,
            marginBottom: 8,
          }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
              ✏️ Updating your previous review
            </Text>
            {originalDate && (
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 }}>
                Originally posted: {originalDate}
              </Text>
            )}
            {updatedDate && (
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                Last updated: {updatedDate}
              </Text>
            )}
          </View>
        )}

        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 100,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: Colors.border,
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
            {cafeSelected && !prefilledCafeName && (
  <TouchableOpacity onPress={() => {
    setCafeName('');
    setCafeSelected(false);
    setSelectedCafeId('');
  }}>
    <Text style={{ fontSize: 16, color: '#aaa' }}>✕</Text>
  </TouchableOpacity>
)}
          </View>

          {cafeSearchResults.length > 0 && (
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              marginTop: 4,
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

        {/* Ratings card */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 12,
          marginHorizontal: 16,
          marginTop: 16,
        }}>
          <ReviewStarRating
            label="DRINKS"
            rating={drinksRating}
            setRating={setDrinksRating}
            showPlus
            expanded={drinksExpanded}
            onToggleExpand={() => setDrinksExpanded(!drinksExpanded)}
          />
          {drinksExpanded && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f9f9f9',
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              marginBottom: 8,
              gap: 8,
            }}>
              <TextInput
                value={itemName}
                onChangeText={setItemName}
                placeholder="What did you drink?"
                placeholderTextColor="#aaa"
                style={{ flex: 1, fontSize: 13, color: Colors.navy }}
              />
              <TouchableOpacity
                onPress={() => setDrinksExpanded(false)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: Colors.red,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 20 }}>−</Text>
              </TouchableOpacity>
            </View>
          )}
          <ReviewStarRating label="FOOD" rating={foodRating} setRating={setFoodRating} />
          <ReviewStarRating label="VIBE" rating={vibeRating} setRating={setVibeRating} />
          <ReviewStarRating label="SERVICE" rating={serviceRating} setRating={setServiceRating} />
        </View>

        {/* What's the move */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#fff',
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
                  borderColor: '#fff',
                  backgroundColor: selectedVibes.includes(vibe) ? Colors.navy : '#fff',
                }}>
                <Text style={{
                  fontSize: 13,
                  color: selectedVibes.includes(vibe) ? '#fff' : Colors.navy,
                  fontWeight: '500',
                }}>
                  {vibe}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{
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
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 16,
          marginHorizontal: 16,
          marginTop: 16,
        }}>
          <TextInput
            value={comments}
            onChangeText={setComments}
            placeholder="Any comments about this visit?"
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
            style={{ fontSize: 14, color: Colors.navy, minHeight: 60 }}
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
            marginHorizontal: 16,
            marginTop: 16,
            gap: 16,
          }}>
          {photos.length > 0 ? (
            <Image
              source={{ uri: photos[0] }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
            />
          ) : (
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 12,
              backgroundColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <CupLogo />
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

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: Colors.red,
            borderRadius: 100,
            paddingVertical: 16,
            marginHorizontal: 60,
            marginTop: 24,
            alignItems: 'center',
          }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20, fontStyle: 'italic' }}>
            {existingReviewId ? "Update Review" : "Let's Sip It"}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomNav activeTab="add" backgroundColor={Colors.background} />
    </SafeAreaView>
  );
}