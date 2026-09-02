import React from "react";
import { Stack } from "expo-router";

export default function BacktestsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="builder" options={{ presentation: "modal" }} />
      <Stack.Screen name="results/[id]" />
      <Stack.Screen name="history/[id]" />
      <Stack.Screen name="bet/[id]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
