import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'components/Button';

interface ErrorSubCardProps {
  title: string;
  message: string;
  onPress: () => void;
}

export default function ErrorSubCard({ title, message, onPress }: ErrorSubCardProps) {
  return (
    <View className="mt-4 w-[70%] rounded-lg bg-red-50 p-4">
      <Text className="mb-2 text-center font-semibold text-red-700">{title}</Text>
      <Text className="text-center text-red-700">{message}</Text>
      <Button
        title="Continue"
        onPress={onPress}
        buttonClassName="mt-2 bg-red-100 rounded-full mx-auto flex justify-center items-center h-[36px] px-4"
        textClassName="text-sm font-semibold text-red-600"
      />
    </View>
  );
}
