import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

interface PageProps {
  children: React.ReactNode;
}
export default function Page(props: PageProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={0}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {props.children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
