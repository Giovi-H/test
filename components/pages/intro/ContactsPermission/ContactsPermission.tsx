import GridBackground from 'components/GridBackdrop';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Card from '../Card';
import MapIcon from './svgs/ContactsIcon';
import { contactsPermissionContent } from './content';
import { Button } from 'components/Button';

import * as contacts from 'expo-contacts';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Page from '../Page';
import ErrorSubCard from '../ErrorSubCard';
import { Colors } from 'utils/colors';

type PermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'cancelled';

export default function ContactsPermission() {
  const { userLocation } = useLocalSearchParams<{ userLocation?: string }>();
  const [contactData, setContactData] = useState<contacts.Contact[] | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFetchingContacts, setIsFetchingContacts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      const { status } = await contacts.getPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        await fetchContacts();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const { data } = await contacts.getContactsAsync();
      console.log('Fetched contacts:', data);
      setContactData(data);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg('Unable to fetch contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllowPressed = async () => {
    try {
      setIsLoading(true);
      setPermissionStatus('requesting');
      setErrorMsg(null); // Clear any previous errors
      const { status } = await contacts.requestPermissionsAsync();

      if (status !== 'granted') {
        setPermissionStatus('denied');
        return;
      }
      setPermissionStatus('granted');
      await fetchContacts();
    } catch (error) {
      setErrorMsg('Error requesting contacts permission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclinePressed = () => {
    setPermissionStatus('denied');
  };

  const router = useRouter();
  const handleContinuePressed = () => {
    router.push({
      pathname: '/intro/profile-setup',
      params: { userLocation: userLocation || '' },
    });
  };

  return (
    <>
      <GridBackground color1="#f2f0ea" color2={Colors.border} />
      <Page>
        <Card
          title={contactsPermissionContent.title}
          subtitle={contactsPermissionContent.subtitle}
          icon={<MapIcon width={100} height={100} />}>
          {permissionStatus !== 'denied' &&
            permissionStatus !== 'granted' &&
            !isFetchingContacts && (
              <View className="mt-2 flex w-full items-center gap-4 px-8">
                <Button
                  title={contactsPermissionContent.acceptButtonText}
                  onPress={handleAllowPressed}
                  buttonClassName="w-full rounded-full mx-auto flex justify-center items-center h-[40px] w-[150px]"
                  buttonStyle={{ backgroundColor: Colors.blue }}
                  textClassName="text-lg font-semibold text-white"
                />
                <Button
                  title={contactsPermissionContent.declineButtonText}
                  textClassName="text-lg font-semibold text-gray-600"
                  onPress={handleDeclinePressed}
                />
              </View>
            )}

          {permissionStatus === 'granted' && (
            <>
              <View className="mt-4 w-full rounded-lg bg-green-50 p-4">
                <Text className="mb-2 text-center font-semibold text-green-700">
                  Contacts Granted ✓
                </Text>
              </View>
              <Button
                title="Continue"
                onPress={handleContinuePressed}
                buttonClassName="mt-6 w-full rounded-full mx-auto flex justify-center items-center h-[40px] w-[150px]"
                buttonStyle={{ backgroundColor: Colors.blue }}
                textClassName="text-lg font-semibold text-white"
              />
            </>
          )}

          {(permissionStatus === 'denied' || permissionStatus === 'cancelled') && (
            <ErrorSubCard
              title="Contacts Permission Denied"
              message="You can enable this later in settings if you change your mind"
              onPress={handleContinuePressed}
            />
            // <View className="mt-4 bg-red-50 p-4 rounded-lg w-[70%]">
            //     <Text className="text-red-700 font-semibold mb-2 text-center">Contacts Permission Denied</Text>
            //     <Text className="text-red-700 text-center">You can enable this later in settings if you change your mind
            //     </Text>
            //     <Button
            //         title="Continue"
            //         onPress={handleContinuePressed}
            //         buttonClassName="mt-2 bg-red-100 rounded-full mx-auto flex justify-center items-center h-[36px] px-4"
            //         textClassName="text-sm font-semibold text-red-600"
            //     />
            // </View>
          )}
        </Card>
      </Page>
    </>
  );
}
