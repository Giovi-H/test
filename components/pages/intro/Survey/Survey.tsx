import GridBackground from 'components/GridBackdrop';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import DragDropSortableList from './DragDropSortableList';
import { surveyContent } from './content';
import { Button } from 'components/Button';
import { useRouter } from 'expo-router';
import Card from '../Card';
import Page from '../Page';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from 'utils/colors';

export default function Survey() {
  const router = useRouter();
  const [rankedPreferences, setRankedPreferences] = useState<string[]>(surveyContent.options);

  const handleNextPressed = async () => {
    await AsyncStorage.setItem('surveyPreferences', JSON.stringify(rankedPreferences));
    router.push('/intro/location-permission');
  };

  return (
    <>
      <GridBackground color1="#f2f0ea" color2={Colors.border} />
      <Page>
        <Card title={surveyContent.title} subtitle={surveyContent.subtitle}>
          <DragDropSortableList
            content={surveyContent.options}
            onOrderChange={setRankedPreferences}
          />
          <Button
            buttonClassName="rounded-full mx-auto flex justify-center items-center h-[40px] w-[150px]"
            buttonStyle={{ backgroundColor: Colors.blue }}
            textClassName="text-lg font-semibold text-white"
            title="NEXT"
            onPress={handleNextPressed}
          />
        </Card>
      </Page>
    </>
  );
}
