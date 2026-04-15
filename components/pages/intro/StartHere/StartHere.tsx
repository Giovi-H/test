import { View } from 'react-native';
import CupLogo from './svgs/CupLogo';
import LogoText from './svgs/LogoText';
import IntroButton from './IntroButton';
import GridBackground from 'components/GridBackdrop';
import { Colors } from 'utils/colors';

export default function StartHere() {
  return (
    <>
      <GridBackground color1={Colors.blue} color2="#4b5a9c" />
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'transparent' }}>
        <View className="items-center justify-center gap-y-4">
          <CupLogo />
          <LogoText />
          <View className="mt-6 gap-y-3 items-center">
            <IntroButton variant="login" />
            <IntroButton variant="register" />
          </View>
        </View>
      </View>
    </>
  );
}