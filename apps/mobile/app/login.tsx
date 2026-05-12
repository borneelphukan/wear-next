import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import axiosInstance from '../api/axiosInstance';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { loginSchema, registerSchema } from '@wear-next/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [authStep, setAuthStep] = useState<'welcome' | 'login' | 'register'>('welcome');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errorMsg = result.error.errors.map(err => err.message).join('\n');
      Alert.alert('Validation Error', errorMsg);
      return;
    }

    try {
      const response = await axiosInstance.post('/users/login', { email, password });
      const { user, accessToken } = response.data;

      await AsyncStorage.setItem('userSession', JSON.stringify({
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        token: accessToken
      }));

      router.replace({
        pathname: '/dashboard',
        params: { id: String(user.id), firstName: user.firstName, email: user.email }
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to sign in. Please check your credentials.';
      Alert.alert('Login Failed', errorMsg);
    }
  };

  const handleRegister = async () => {
    const result = registerSchema.safeParse({
      firstName, lastName, email, password,
      phone: phone || undefined,
    });

    if (!result.success) {
      const errorMsg = result.error.errors.map(err => err.message).join('\n');
      Alert.alert('Validation Error', errorMsg);
      return;
    }

    try {
      const response = await axiosInstance.post('/users/register', {
        firstName, lastName, email, password,
        phone: phone || undefined,
      });

      const { user, accessToken } = response.data;
      await AsyncStorage.setItem('userSession', JSON.stringify({
        firstName: user.firstName, email: user.email, token: accessToken
      }));

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
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar style="dark" />

      {/* ── Welcome Screen ── */}
      {authStep === 'welcome' && (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: 30, paddingTop: 65, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Glow decoration */}
          <View className="absolute -top-36 w-[500px] h-[350px] rounded-full bg-[#e3e1fa33]" />

          {/* Logo Card */}
          <View className="w-[90px] h-[90px] rounded-[22px] bg-surface justify-center items-center mb-6"
            style={{ shadowColor: '#3182ce', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 }}
          >
            <MaterialCommunityIcons name="hanger" size={36} color="#3182ce" />
          </View>

          <Text className="text-[32px] font-black text-dark tracking-tight mb-3 dark:text-light">WearNext</Text>
          <Text className="text-[15px] text-muted text-center leading-6 mb-9 px-4 font-medium dark:text-light">
            Your sophisticated digital concierge for an effortless wardrobe.
          </Text>

          {/* Google Button */}
          <TouchableOpacity className="flex-row w-full h-[52px] bg-[#eae9f1] rounded-full justify-center items-center mb-4">
            <MaterialIcons name="mail" size={18} color="#1a1a24" style={{ marginRight: 10 }} />
            <Text className="text-dark text-base font-semibold dark:text-light">Continue with Google</Text>
          </TouchableOpacity>

          {/* OR Separator */}
          <View className="flex-row items-center my-6 w-full px-2">
            <View className="flex-1 h-px bg-[#e3e1ea]" />
            <Text className="text-[11px] font-extrabold text-faint mx-4 tracking-widest dark:text-light">OR</Text>
            <View className="flex-1 h-px bg-[#e3e1ea]" />
          </View>

          {/* Email Button */}
          <TouchableOpacity
            className="flex-row w-full h-[52px] bg-brand rounded-full justify-center items-center mb-5"
            style={{ shadowColor: '#3182ce', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 3 }}
            onPress={() => setAuthStep('login')}
          >
            <MaterialIcons name="mail" size={18} color="#ffffff" style={{ marginRight: 10 }} />
            <Text className="text-white text-base font-semibold">Log in with Email</Text>
          </TouchableOpacity>

          {/* Toggle */}
          <View className="flex-row justify-center items-center mt-2 mb-1">
            <Text className="text-muted text-[15px] font-medium dark:text-light">{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => setAuthStep('register')}>
              <Text className="text-brand text-[15px] font-extrabold">Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="my-2 py-1">
            <Text className="text-muted text-sm font-semibold dark:text-light">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Disclaimer */}
          <View className="mt-auto pt-8 w-full">
            <Text className="text-[#8b8a9f] text-xs text-center leading-5 font-medium">
              {"By continuing, you agree to WearNext's "}
              <Text className="underline text-muted font-semibold dark:text-light">Terms of Service</Text>
              {' and '}
              <Text className="underline text-muted font-semibold dark:text-light">Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ── Login / Register Form ── */}
      {(authStep === 'login' || authStep === 'register') && (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 25, paddingTop: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8 pt-2">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-surface justify-center items-center"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 }}
              onPress={() => setAuthStep('welcome')}
            >
              <MaterialIcons name="arrow-back-ios" size={20} color="#222" />
            </TouchableOpacity>
            <Text className="text-[18px] font-extrabold text-dark dark:text-light">
              {authStep === 'login' ? 'Log in with Email' : 'Create Account'}
            </Text>
            <View className="w-10" />
          </View>

          {/* Form Card */}
          <View
            className="w-full bg-surface rounded-3xl p-6"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 }}
          >
            {authStep === 'register' && (
              <>
                <Text className="text-[13px] font-semibold text-muted mb-2 uppercase tracking-widest dark:text-light">First Name</Text>
                <TextInput
                  className="h-[50px] bg-bg border border-border-brand rounded-xl px-4 text-dark text-[15px] mb-5 dark:text-light"
                  placeholder="First Name"
                  placeholderTextColor="#888"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <Text className="text-[13px] font-semibold text-muted mb-2 uppercase tracking-widest dark:text-light">Last Name</Text>
                <TextInput
                  className="h-[50px] bg-bg border border-border-brand rounded-xl px-4 text-dark text-[15px] mb-5 dark:text-light"
                  placeholder="Last Name"
                  placeholderTextColor="#888"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <Text className="text-[13px] font-semibold text-muted mb-2 uppercase tracking-widest dark:text-light">Phone (Optional)</Text>
                <TextInput
                  className="h-[50px] bg-bg border border-border-brand rounded-xl px-4 text-dark text-[15px] mb-5 dark:text-light"
                  placeholder="Phone"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </>
            )}

            <Text className="text-[13px] font-semibold text-muted mb-2 uppercase tracking-widest dark:text-light">Email Address</Text>
            <TextInput
              className="h-[50px] bg-bg border border-border-brand rounded-xl px-4 text-dark text-[15px] mb-5 dark:text-light"
              placeholder="name@example.com"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text className="text-[13px] font-semibold text-muted mb-2 uppercase tracking-widest dark:text-light">Password</Text>
            <TextInput
              className="h-[50px] bg-bg border border-border-brand rounded-xl px-4 text-dark text-[15px] mb-5 dark:text-light"
              placeholder="••••••••"
              placeholderTextColor="#888"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              className="bg-brand h-[50px] rounded-full justify-center items-center mt-2 mb-5"
              style={{ shadowColor: '#3182ce', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 3 }}
              onPress={authStep === 'login' ? handleLogin : handleRegister}
            >
              <Text className="text-white text-base font-bold">
                {authStep === 'login' ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-1 mb-1">
              <Text className="text-muted text-[15px] font-medium dark:text-light">
                {authStep === 'login' ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setAuthStep(authStep === 'login' ? 'register' : 'login')}>
                <Text className="text-brand text-[15px] font-extrabold">
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
