import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Caveat_700Bold, Caveat_400Regular } from '@expo-google-fonts/caveat';
import CupLogo from 'components/pages/intro/StartHere/svgs/CupLogo';
import LogoText from 'components/pages/intro/StartHere/svgs/LogoText';
import GridBackground from 'components/GridBackdrop';
import { Colors } from 'utils/colors';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded] = useFonts({ Caveat_700Bold, Caveat_400Regular });

  if (!fontsLoaded) return null;

  return (
    <>
      <GridBackground color1={Colors.blue} color2="#4b5a9c" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <CupLogo />
          <LogoText />
        </View>

        <View style={styles.card}>
          <Text style={[styles.welcomeTitle, { fontFamily: 'Caveat_700Bold' }]}>
            Welcome back!
          </Text>
          <Text style={[styles.welcomeSubtitle, { fontFamily: 'Caveat_400Regular' }]}>
            Let's explore some cafes :)
          </Text>

          <TextInput
            placeholder="enter your email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { fontFamily: 'Caveat_400Regular' }]}
          />

          <View style={styles.passwordRow}>
            <TextInput
              placeholder="enter your password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              style={[styles.inputInner, { fontFamily: 'Caveat_400Regular' }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Text style={[styles.forgotPassword, { fontFamily: 'Caveat_400Regular' }]}>
              forgot your password?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={[styles.orText, { fontFamily: 'Caveat_400Regular' }]}>
            —or log in with—
          </Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={{ fontSize: 28 }}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={{ fontSize: 28 }}>🍎</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { fontFamily: 'Caveat_400Regular' }]}>
            don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/intro/survey')}>
            <Text style={[styles.registerLink, { fontFamily: 'Caveat_700Bold' }]}>
              register now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    gap: 15,
  },
  logoSection: {
    alignItems: 'center',
    gap: 4,
    marginBottom: -60,
    transform: [{ scale: 0.7 }],
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    color: '#1C2120',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#1C2120',
    marginTop: -8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1C2120',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    paddingHorizontal: 16,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1C2120',
  },
  eyeButton: {
    paddingLeft: 8,
  },
  forgotPassword: {
    fontSize: 15,
    color: '#1C2120',
    textAlign: 'center',
  },
  orText: {
    fontSize: 16,
    color: '#1C2120',
    textAlign: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    width: 70,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  registerLink: {
    fontSize: 16,
    color: '#5CE1E6',
  },
});