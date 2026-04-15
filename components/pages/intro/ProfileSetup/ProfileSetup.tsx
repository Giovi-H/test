import GridBackground from 'components/GridBackdrop';
import React, { useState, useEffect, useRef } from 'react';
import { Platform, Text, View, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import Card from '../Card';
import ProfilePicIcon from './svgs/ProfilePicIcon';
import FormInput from './FormInput';
import NameIcon from './svgs/form/NameIcon';
import PhoneIcon from './svgs/form/PhoneIcon';
import EmailIcon from './svgs/form/EmailIcon';
import BirthdayIcon from './svgs/form/BirthdayIcon';
import MapIcon from './svgs/form/MapIcon';
import { profileSetupContent } from './content';
import Page from '../Page';
import { Button } from 'components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from 'utils/ProfileContext';
import { Colors } from 'utils/colors';

export default function ProfileSetup() {
  const { userLocation } = useLocalSearchParams<{ userLocation?: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');

  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
  const birthdayRef = useRef<TextInput>(null);
  const { setUserId } = useProfile();

  useEffect(() => {
    if (userLocation) {
      setLocation(userLocation);
    }
  }, [userLocation]);

  const handleContinuePressed = async () => {
    console.log('continue pressed', { name, phoneNumber, email, birthday, location });
    if (name && phoneNumber && email && birthday && location) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: name,
          phone: phoneNumber,
          email: email,
          birthday: birthday,
          user_location: location,
        })
        .select()
        .single();

      if (error) {
        alert('Error saving profile: ' + error.message);
        return;
      }

      const stored = await AsyncStorage.getItem('surveyPreferences');
      console.log('stored preferences:', stored);
      if (stored) {
        const rankedPreferences = JSON.parse(stored);
        const preferences = rankedPreferences.map((preference: string, index: number) => ({
          user_id: data.id,
          preference,
          ranking: index + 1,
        }));
        const { error: surveyError } = await supabase
          .from('user_survey_preferences')
          .insert(preferences);

        if (surveyError) {
          alert('Error saving preferences: ' + surveyError.message);
          return;
        }
      }

      console.log('Profile and preferences saved successfully!');
      setUserId(data.id);
      await AsyncStorage.setItem('userId', String(data.id));
      router.push('/home');
    }
  };

  return (
    <>
      <GridBackground color1="#f2f0ea" color2={Colors.border} />
      <Page>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="w-full items-center">
            <Card
              title={profileSetupContent.title}
              subtitle={profileSetupContent.subtitle}
              icon={<ProfilePicIcon width={100} height={100} />}>
              <View className="items-center">
                <FormInput
                  icon={<NameIcon width={24} height={24} />}
                  value={name}
                  onChangeText={setName}
                  placeholder="Username"
                  inputRef={nameRef}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
                <FormInput
                  icon={<PhoneIcon width={24} height={24} />}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Phone Number"
                  inputRef={phoneRef}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
                <FormInput
                  icon={<EmailIcon width={24} height={24} />}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  inputRef={emailRef}
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => locationRef.current?.focus()}
                />
                <FormInput
                  icon={<MapIcon width={24} height={24} />}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Location"
                  inputRef={locationRef}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                {Platform.OS === 'ios' ? (
                  <View className="mb-4 flex w-full flex-row items-center gap-x-2 rounded-3xl border border-gray-400 px-4">
                    <BirthdayIcon width={24} height={24} />
                    <DateTimePicker
                      value={birthday ? new Date(birthday) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || new Date();
                        setBirthday(currentDate.toISOString().split('T')[0]);
                      }}
                      className="mb-4 w-full"
                    />
                  </View>
                ) : (
                  <FormInput
                    icon={<BirthdayIcon width={24} height={24} />}
                    value={birthday}
                    onChangeText={setBirthday}
                    placeholder="Birthday (YYYY-MM-DD)"
                  />
                )}
              </View>
              <Button
                buttonClassName="rounded-full mx-auto flex justify-center items-center h-[40px] w-[150px] mt-4"
                buttonStyle={{ backgroundColor: Colors.blue }}
                textClassName="text-lg font-semibold text-white"
                title="CONTINUE"
                onPress={handleContinuePressed}
              />
            </Card>
          </View>
        </TouchableWithoutFeedback>
      </Page>
    </>
  );
}
