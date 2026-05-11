import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
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
        const stored = await AsyncStorage.getItem("userSession");
        if (stored) {
          setSession(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkSession();

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
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
      <View className="flex-1 bg-[#050505] justify-center items-center p-8">
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-5xl font-black text-white tracking-wide">WearNext</Text>
          <View className="mt-8 h-[70px] w-[70px] rounded-full bg-[#3a86ff15] justify-center items-center">
            <ActivityIndicator size="large" color="#3a86ff" />
          </View>
        </View>
        <View className="w-full px-5 mb-12">
          <View
            className="h-1 bg-[#3a86ff] rounded-sm mb-2"
            style={{ width: `${loadingProgress}%` }}
          />
          <Text className="text-[#666] text-xs text-center tracking-widest">
            Loading Ecosystem {loadingProgress}%
          </Text>
        </View>
      </View>
    );
  }

  if (session) {
    return (
      <Redirect
        href={{
          pathname: "/dashboard",
          params: { firstName: session.firstName, email: session.email },
        }}
      />
    );
  }

  return <Redirect href="/login" />;
}
