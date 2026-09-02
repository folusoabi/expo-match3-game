import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/theme";
import { useApp } from "@/state/AppProvider";

function tabIcon(active: keyof typeof Ionicons.glyphMap, inactive: keyof typeof Ionicons.glyphMap) {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons name={focused ? active : inactive} size={size - 2} color={color} />
  );
}

function SlipTabIcon({ focused, color, size }: { focused: boolean; color: string; size: number }) {
  const { slip } = useApp();
  return (
    <View>
      <Ionicons name={focused ? "receipt" : "receipt-outline"} size={size - 2} color={color} />
      {slip.length > 0 ? (
        <View className="absolute -top-1.5 -right-2 bg-edge rounded-full min-w-[16px] h-4 items-center justify-center px-1">
          <Text className="text-white text-[9px] font-sans-bold">{slip.length}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: "Inter_500Medium" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: tabIcon("home", "home-outline") }} />
      <Tabs.Screen name="sports" options={{ title: "Sports", tabBarIcon: tabIcon("football", "football-outline") }} />
      <Tabs.Screen name="slip" options={{ title: "Bet Slip", tabBarIcon: SlipTabIcon }} />
      <Tabs.Screen name="history" options={{ title: "History", tabBarIcon: tabIcon("time", "time-outline") }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: tabIcon("person-circle", "person-circle-outline") }} />
    </Tabs>
  );
}
