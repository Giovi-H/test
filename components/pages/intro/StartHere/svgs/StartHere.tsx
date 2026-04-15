import { Text, View } from 'react-native';
import CupLogo from './CupLogo';
import LogoText from './LogoText';

export default function StartHere() {
  return (
    <View className="flex h-screen flex-col items-center justify-center gap-4 bg-black">
      <CupLogo />
      <LogoText />
      <Text className="text-3xl font-bold text-white">test</Text>
    </View>
  );
}
