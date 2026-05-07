import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { PaperProvider } from "react-native-paper";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="dashboard" />
      </Stack>
      <StatusBar style="light" />
    </PaperProvider>
  );
}
