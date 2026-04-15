// Button base class for flexible reuse. Implements all features except theming and size variants.
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import React from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  buttonClassName?: string;
  textClassName?: string;
  buttonStyle?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  buttonClassName,
  textClassName,
  buttonStyle,
}) => {
  const styles = StyleSheet.create({
    disabled: {
      opacity: 0.6,
    },
  });
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={buttonClassName}
      style={buttonStyle}>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className={textClassName}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
