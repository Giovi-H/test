import GridBackground from 'components/GridBackdrop';
import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import Card from '../Card';
import MapIcon from './svgs/MapIcon';
import { Button } from 'components/Button';
import { locationPermissionContent } from './content';

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import Page from '../Page';
import ErrorSubCard from '../ErrorSubCard';
import { Colors } from 'utils/colors';

type PermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'cancelled';

export default function LocationPermission() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFetchingLocation, setIsLoading] = useState(false);

  // Check existing permissions on mount
  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        await fetchLocation();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(location);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg('Unable to fetch location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllowPressed = async () => {
    try {
      setIsLoading(true);
      setPermissionStatus('requesting');
      setErrorMsg(null); // Clear any previous errors

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setPermissionStatus('denied');
        setErrorMsg(null); // Don't set error message here - let the denied state handle it
        setIsLoading(false);
        return;
      }

      setPermissionStatus('granted');
      await fetchLocation();
    } catch (error) {
      setErrorMsg('An error occurred while requesting permissions');
      setPermissionStatus('idle'); // Reset to idle on actual errors
      setIsLoading(false);
    }
  };

  const handleDeclinePressed = () => {
    setPermissionStatus('denied');
    // Navigate away or handle decline logic
  };

  const handleCancelPressed = () => {
    setIsLoading(false);
    setPermissionStatus('cancelled');
    console.log('User cancelled location fetching');
  };

  const router = useRouter();
  const handleContinuePressed = async () => {
    if (location) {
      try {
        // Convert lat/lon to address and pass to router
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address[0]) {
          const formattedLocation = [address[0].city, address[0].region, address[0].country]
            .filter(Boolean)
            .join(', ');

          router.push({
            pathname: '/intro/contacts-permission',
            params: { userLocation: formattedLocation },
          });
          return;
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    }

    router.push('/intro/contacts-permission');
  };

  return (
    <>
      <GridBackground color1="#f2f0ea" color2={Colors.border} />
      <Page>
        <Card
          title={locationPermissionContent.title}
          subtitle={locationPermissionContent.subtitle}
          icon={<MapIcon width={100} height={100} />}>
          {isFetchingLocation && (
            <View className="my-4">
              <ActivityIndicator size="large" color={Colors.blue} />
              <Text className="mt-2 text-center text-sm text-gray-600">
                Getting your location...
              </Text>
              <Button
                title="Cancel"
                onPress={handleCancelPressed}
                buttonClassName="mt-2 bg-red-100 rounded-full mx-auto flex justify-center items-center h-[36px] px-4"
                textClassName="text-sm font-semibold text-red-600"
              />
            </View>
          )}

          {errorMsg && (
            <View className="mb-4 rounded-lg bg-red-50 p-3">
              <Text className="text-center text-red-600">{errorMsg}</Text>
              <Button
                title="Continue anyway"
                onPress={handleContinuePressed}
                buttonClassName="mt-2 bg-red-100 rounded-full mx-auto flex justify-center items-center h-[36px] px-4"
                textClassName="text-sm font-semibold text-red-600"
              />
            </View>
          )}

          {/* Permission was not yet requested */}
          {permissionStatus !== 'cancelled' &&
            permissionStatus !== 'denied' &&
            permissionStatus !== 'granted' &&
            !isFetchingLocation && (
              <View className="mt-2 flex w-full items-center gap-4 px-8">
                <Button
                  title={locationPermissionContent.acceptButtonText}
                  onPress={handleAllowPressed}
                  buttonClassName="w-full rounded-full mx-auto flex justify-center items-center h-[40px] w-[150px] px-4"
                  buttonStyle={{ backgroundColor: Colors.blue }}
                  textClassName="text-lg font-semibold text-white"
                />
                <Button
                  title={locationPermissionContent.declineButtonText}
                  textClassName="text-lg font-semibold text-gray-600"
                  onPress={handleDeclinePressed}
                />
              </View>
            )}

          {(permissionStatus === 'denied' || permissionStatus === 'cancelled') &&
            !isFetchingLocation && (
              <ErrorSubCard
                title="Location Permission Denied"
                message="You have denied location access. Some features may not work properly. You can enable this later in settings if you change your mind."
                onPress={handleContinuePressed}
              />
              // <View className="mt-4 bg-red-50 p-4 rounded-lg w-full">
              //     <Text className="text-red-700 font-semibold mb-2">Location Permission Denied</Text>
              //     <Text className="text-sm text-gray-600">
              //         You have denied location access. Some features may not work properly.
              //     </Text>
              //     <Button
              //         title="Continue anyway"
              //         onPress={handleContinuePressed}
              //         buttonClassName="mt-2 bg-red-100 rounded-full mx-auto flex justify-center items-center h-[36px] px-4"
              //         textClassName="text-sm font-semibold text-red-600"
              //     />
              // </View>
            )}
          {/* Permission was granted */}
          {location && permissionStatus === 'granted' && (
            <>
              <View className="mt-4 w-full rounded-lg bg-green-50 p-4">
                <Text className="mb-2 font-semibold text-green-700">Location Granted ✓</Text>
                <Text className="text-sm text-gray-600">
                  Lat: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text className="text-sm text-gray-600">
                  Lng: {location.coords.longitude.toFixed(6)}
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
        </Card>
      </Page>
    </>
  );
}
