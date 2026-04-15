import React from 'react';
import { TextInput, View, ReturnKeyTypeOptions } from 'react-native';

export default function FormInput(props: {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ReactNode;
  inputRef?: React.RefObject<TextInput | null>;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}) {
  return (
    <View className="mb-4 flex w-full flex-row items-center gap-x-2 rounded-3xl border border-gray-400 px-4">
      {props.icon}
      {/* Should probably add autocomplete here https://reactnative.dev/docs/textinput#autocomplete */}
      <TextInput
        ref={props.inputRef}
        placeholder={props.placeholder}
        value={props.value}
        onChangeText={props.onChangeText}
        className="text-md h-10 flex-1"
        returnKeyType={props.returnKeyType || 'done'}
        onSubmitEditing={props.onSubmitEditing}
        keyboardType={props.keyboardType}
        blurOnSubmit={false}
      />
    </View>
  );
}
