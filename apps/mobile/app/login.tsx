import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { loginSchema, registerSchema } from '@wear-next/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
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
      const response = await axios.post('http://localhost:4000/users/login', {
        email,
        password,
      });

      const { user } = response.data;
      
      await AsyncStorage.setItem('userSession', JSON.stringify({ firstName: user.firstName, email: user.email }));

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
      const response = await axios.post('http://localhost:4000/users/register', {
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
      });

      const user = response.data;

      await AsyncStorage.setItem('userSession', JSON.stringify({ firstName: user.firstName, email: user.email }));

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
    <View style={styles.authContainer}>
      <StatusBar style="light" />
      <View style={styles.greenHeader}>
        <Text style={styles.headerTitle}>Welcome</Text>
        <Text style={styles.headerSubtitle}>
          {authMode === 'login' ? 'Sign in to continue' : 'Sign up to continue'}
        </Text>
      </View>

      <View style={styles.whiteCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {authMode === 'login' && (
            <>
              {/* Google Button */}
              <TouchableOpacity style={styles.googleButton}>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* OR Separator */}
              <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>OR</Text>
                <View style={styles.separatorLine} />
              </View>
            </>
          )}

          {authMode === 'register' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#888"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#888"
                value={lastName}
                onChangeText={setLastName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone (Optional)"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          {authMode === 'login' && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={authMode === 'login' ? handleLogin : handleRegister}
          >
            <Text style={styles.primaryButtonText}>
              {authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              <Text style={styles.toggleAction}>
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#2e45a0ff', // Rich green background for the top
  },
  greenHeader: {
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffffff',
    fontWeight: '600',
  },
  whiteCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#ffffff',
  },
  googleButtonText: {
    color: '#23775b',
    fontSize: 15,
    fontWeight: '600',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e6e6e6',
  },
  separatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    marginHorizontal: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#000000',
    fontSize: 15,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: 5,
  },
  forgotText: {
    color: '#23775b',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2e45a0ff',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    shadowColor: '#23775b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleLabel: {
    color: '#666666',
    fontSize: 14,
  },
  toggleAction: {
    color: '#23775b',
    fontSize: 14,
    fontWeight: '700',
  },
});
