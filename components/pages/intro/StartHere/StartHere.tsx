import { View } from 'react-native';
import CupLogo from './svgs/CupLogo';
import LogoText from './svgs/LogoText';
import IntroButton from './IntroButton';
import classes from 'utils/classes';

export default function StartHere() {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#3A4B94' }}>
      <View className="items-center justify-center gap-y-4">
        <CupLogo />
        <LogoText />
        <View className="mt-6 gap-y-3 items-center">
          <IntroButton variant="login" />
          <IntroButton variant="register" />
        </View>
      </View>
    </View>
  );
}