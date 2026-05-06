import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSplashScreen, setIsSplashScreen] = useState(true);
  const [session, setSession] = useState<{ firstName: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('userSession');
        if (stored) {
          setSession(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkSession();

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSplashScreen(false);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  if (isSplashScreen) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <View style={styles.splashLogoContainer}>
          <Text style={styles.splashTitle}>WearNext</Text>
          <View style={styles.pulseRing}>
            <ActivityIndicator size="large" color="#3a86ff" />
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
          <Text style={styles.loadingText}>Loading Ecosystem {loadingProgress}%</Text>
        </View>
      </View>
    );
  }

  if (session) {
    return <Redirect href={{ pathname: '/dashboard', params: { firstName: session.firstName, email: session.email } }} />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  splashLogoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashSub: {
    fontSize: 11,
    color: '#3a86ff',
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 8,
  },
  splashTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  pulseRing: {
    marginTop: 30,
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: '#3a86ff15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3a86ff',
    borderRadius: 2,
    marginBottom: 10,
  },
  loadingText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
