import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import axiosInstance from '../api/axiosInstance';
import Svg, { Path, Circle } from 'react-native-svg';
import { loginSchema, registerSchema } from '@wear-next/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Custom Premium SVG Icons for beautiful visual aesthetics
const HangerLogo = () => (
  <Svg width={46} height={46} viewBox="0 0 64 64" fill="none">
    {/* Elegant top hook */}
    <Path
      d="M32 18C32 18 35.5 13.5 32 10C28.5 6.5 25.5 9.5 25.5 13C25.5 16.5 32 20.5 32 20.5"
      stroke="#5e5ce6"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Diamond-hanger shape */}
    <Path
      d="M32 20.5L54 31.5L32 42.5L10 31.5Z"
      stroke="#5e5ce6"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Sleek dual motion lines on the right for sophistication */}
    <Path
      d="M54 31.5L44 26.5"
      stroke="#5e5ce6"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Path
      d="M49 34L40 29.5"
      stroke="#9d9cf4"
      strokeWidth={2}
      strokeLinecap="round"
    />
    {/* Premium inner jewel/dot */}
    <Circle cx={32} cy={31.5} r={3.5} fill="#5e5ce6" />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 48 48" style={{ marginRight: 10 }}>
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <Path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.67H24v8.86h12.64c-.55 2.86-2.16 5.28-4.58 6.91l7.1 5.5C43.3 36.55 46.5 30.82 46.5 24z" />
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.5c-1.97 1.32-4.5 2.11-8.79 2.11-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <Path fill="#FBBC05" d="M10.54 28.89c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59L2.56 13.52C.92 16.79 0 20.29 0 24s.92 7.21 2.56 10.48l7.98-6.19z" />
  </Svg>
);

const AppleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="#ffffff" style={{ marginRight: 10 }}>
    <Path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
  </Svg>
);

const MailIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 10 }}>
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Path d="M22 6l-10 7L2 6" />
  </Svg>
);

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5" />
    <Path d="M12 19l-7-7 7-7" />
  </Svg>
);

export default function LoginScreen() {
  // Navigation step state: 'welcome' | 'login' | 'register'
  const [authStep, setAuthStep] = useState<'welcome' | 'login' | 'register'>('welcome');
  const router = useRouter();

  // Auth Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Handle Login validation with Zod and API call
  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errorMsg = result.error.errors.map(err => err.message).join('\n');
      Alert.alert('Validation Error', errorMsg);
      return;
    }

    try {
      const response = await axiosInstance.post('/users/login', {
        email,
        password,
      });

      const { user, accessToken } = response.data;
      
      await AsyncStorage.setItem('userSession', JSON.stringify({ firstName: user.firstName, email: user.email, token: accessToken }));

      router.replace({
        pathname: '/dashboard',
        params: { firstName: user.firstName, email: user.email }
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to sign in. Please check your credentials.';
      Alert.alert('Login Failed', errorMsg);
    }
  };

  // Handle Registration validation with Zod and API call
  const handleRegister = async () => {
    const result = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      phone: phone || undefined,
    });

    if (!result.success) {
      const errorMsg = result.error.errors.map(err => err.message).join('\n');
      Alert.alert('Validation Error', errorMsg);
      return;
    }

    try {
      const response = await axiosInstance.post('/users/register', {
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
      });

      const { user, accessToken } = response.data;
      
      await AsyncStorage.setItem('userSession', JSON.stringify({ firstName: user.firstName, email: user.email, token: accessToken }));

      router.replace({
        pathname: '/dashboard',
        params: { firstName: user.firstName, email: user.email }
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to register. Please try again.';
      Alert.alert('Registration Failed', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {authStep === 'welcome' && (
        <ScrollView contentContainerStyle={styles.welcomeScrollContent} showsVerticalScrollIndicator={false}>
          {/* Subtle elegant radial background element */}
          <View style={styles.glowTop} />

          {/* Logo Card */}
          <View style={styles.logoCard}>
            <HangerLogo />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>WearNext</Text>
          <Text style={styles.subtitle}>
            Your sophisticated digital concierge for an effortless wardrobe.
          </Text>

          {/* Social Sign-In Buttons */}
          <TouchableOpacity style={styles.googleButton}>
            <GoogleIcon />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>


          {/* Beautiful OR Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Log in with Email Button */}
          <TouchableOpacity style={styles.emailButton} onPress={() => setAuthStep('login')}>
            <MailIcon />
            <Text style={styles.emailButtonText}>Log in with Email</Text>
          </TouchableOpacity>

          {/* Toggle / Extra Links */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => setAuthStep('register')}>
              <Text style={styles.toggleAction}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Disclaimer Footer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              By continuing, you agree to WearNext's{' '}
              <Text style={styles.disclaimerLink}>Terms of Service</Text> and{' '}
              <Text style={styles.disclaimerLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      )}

      {(authStep === 'login' || authStep === 'register') && (
        <ScrollView contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false}>
          {/* Navigation Header */}
          <View style={styles.formHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setAuthStep('welcome')}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={styles.formHeaderTitle}>
              {authStep === 'login' ? 'Log in with Email' : 'Create Account'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Form Inputs Container */}
          <View style={styles.formContainer}>
            {authStep === 'register' && (
              <>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#888"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#888"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <Text style={styles.inputLabel}>Phone (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#888"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={authStep === 'login' ? handleLogin : handleRegister}
            >
              <Text style={styles.primaryButtonText}>
                {authStep === 'login' ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>
                {authStep === 'login' ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setAuthStep(authStep === 'login' ? 'register' : 'login')}>
                <Text style={styles.toggleAction}>
                  {authStep === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fc',
  },
  glowTop: {
    position: 'absolute',
    top: -150,
    left: width / 2 - 250,
    width: 500,
    height: 350,
    borderRadius: 250,
    backgroundColor: '#e3e1fa33',
  },
  welcomeScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 65,
    paddingBottom: 40,
  },
  logoCard: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a24',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#656475',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 35,
    paddingHorizontal: 15,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    backgroundColor: '#eae9f1',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  googleButtonText: {
    color: '#1a1a24',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    backgroundColor: '#13131c',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
    paddingHorizontal: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e3e1ea',
  },
  separatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8b8a9f',
    marginHorizontal: 15,
    letterSpacing: 2,
  },
  emailButton: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    backgroundColor: '#5e5ce6',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  emailButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  toggleLabel: {
    color: '#656475',
    fontSize: 15,
    fontWeight: '500',
  },
  toggleAction: {
    color: '#5e5ce6',
    fontSize: 15,
    fontWeight: '700',
  },
  forgotBtn: {
    marginVertical: 10,
    paddingVertical: 5,
  },
  forgotText: {
    color: '#656475',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimerContainer: {
    marginTop: 'auto',
    paddingTop: 30,
    width: '100%',
  },
  disclaimerText: {
    color: '#8b8a9f',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  disclaimerLink: {
    textDecorationLine: 'underline',
    color: '#656475',
    fontWeight: '600',
  },
  formScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a24',
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#656475',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 50,
    backgroundColor: '#f8f7fc',
    borderWidth: 1,
    borderColor: '#e8e7fc',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#1a1a24',
    fontSize: 15,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#5e5ce6',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
