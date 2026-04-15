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
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from 'utils/ProfileContext';
import { supabase } from 'utils/supabase';
import BottomNav from 'components/BottomNav';
import { Colors } from 'utils/colors';
import * as FileSystem from 'expo-file-system/legacy';

export default function EditProfilePage() {
  const router = useRouter();
  const { profileImage, setProfileImage, userId } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');

  useEffect(() => {
    if (!userId) return;
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('name, username, email, phone, user_location, birthday')
        .eq('id', userId)
        .single();

      if (data) {
        setName(data.name || data.username || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLocation(data.user_location || '');
        setBirthday(data.birthday || '');
      }
    };
    loadProfile();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('users')
      .update({
        name: name,
        email: email,
        phone: phone,
        user_location: location,
        birthday: birthday,
      })
      .eq('id', userId);

    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      alert('Profile updated!');
      router.back();
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });
    if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfileImage({ uri });
        await uploadProfileImage(uri);
    }
};

const uploadProfileImage = async (uri: string) => {
    if (!userId) return;
    try {
        const fileName = `profile_${userId}.jpg`;
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const { error: uploadError } = await supabase.storage
            .from('review-photos')
            .upload(fileName, byteArray, { contentType: 'image/jpeg', upsert: true });

        if (uploadError) {
            console.error('Upload error:', uploadError.message);
            return;
        }

        const { data: urlData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);

        await supabase
            .from('users')
            .update({ profile_image_url: urlData.publicUrl })
            .eq('id', userId);

    } catch (err) {
        console.error('Profile image upload error:', err);
    }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.blue }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.blue} />

      {/* Back button - fixed */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          left: 20,
          top: 60,
          backgroundColor: Colors.red,
          borderRadius: 100,
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Blue header */}
        <View
          style={{
            backgroundColor: Colors.blue,
            paddingTop: 40,
            paddingBottom: 10,
            alignItems: 'center',
          }}>
          <View
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: '#fff',
            }}>
            <Image
              source={profileImage}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          <TouchableOpacity
            onPress={pickImage}
            style={{
              position: 'absolute',
              bottom: 15,
              right: '35%',
              backgroundColor: Colors.navy,
              borderRadius: 100,
              width: 28,
              height: 28,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}>
            <Image source={require('../../assets/camera.png')} style={{ width: 25, height: 25 }} />
          </TouchableOpacity>
        </View>

        {/* White section */}
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 60,
            borderTopRightRadius: 60,
            padding: 24,
            paddingTop: 30,
          }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: Colors.navy,
              marginBottom: 20,
              marginTop: 30,
            }}>
            Edit Profile
          </Text>

          {/* Name */}
          <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 6, paddingLeft: 10 }}>
            Name*
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginBottom: 16,
            }}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={{ flex: 1, fontSize: 14, color: Colors.navy }}
            />
            <Image source={require('../../assets/pencil.png')} style={{ width: 25, height: 25 }} />
          </View>

          {/* Email */}
          <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 6, paddingLeft: 10 }}>
            Email*
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginBottom: 16,
            }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={{ flex: 1, fontSize: 14, color: Colors.navy }}
              keyboardType="email-address"
            />
            <Image source={require('../../assets/pencil.png')} style={{ width: 25, height: 25 }} />
          </View>

          {/* Phone */}
          <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 6, paddingLeft: 10 }}>
            Phone Number
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginBottom: 16,
            }}>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={{ flex: 1, fontSize: 14, color: Colors.navy }}
              keyboardType="phone-pad"
            />
            <Image source={require('../../assets/pencil.png')} style={{ width: 25, height: 25 }} />
          </View>

          {/* Location */}
          <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 6, paddingLeft: 10 }}>
            Location
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginBottom: 16,
            }}>
            <TextInput
              value={location}
              onChangeText={setLocation}
              style={{ flex: 1, fontSize: 14, color: Colors.navy }}
            />
            <Image source={require('../../assets/pencil.png')} style={{ width: 25, height: 25 }} />
          </View>

          {/* Birthday */}
          <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 6, paddingLeft: 10 }}>
            Birthday
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginBottom: 24,
            }}>
            <TextInput
              value={birthday}
              onChangeText={setBirthday}
              style={{ flex: 1, fontSize: 14, color: Colors.navy }}
            />
            <Image source={require('../../assets/pencil.png')} style={{ width: 25, height: 25 }} />
          </View>

          {/* Settings buttons */}
          {['change password', 'notifications', 'support', 'frequently asked questions'].map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={{
                  backgroundColor: Colors.blue,
                  borderRadius: 100,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  alignSelf: 'flex-start',
                  marginBottom: 10,
                }}>
                <Text style={{ color: '#fff', fontSize: 13 }}>{item}</Text>
              </TouchableOpacity>
            )
          )}

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: Colors.red,
              borderRadius: 100,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 16,
            }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 }}>
              SAVE CHANGES
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}
