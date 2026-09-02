import React, { useMemo } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text, MonoText } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";
import { useApp, STARTING_BALANCE } from "@/state/AppProvider";

const MENU: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "My Predictions", icon: "receipt-outline", route: "/(tabs)/history" },
  { label: "Performance", icon: "stats-chart-outline", route: "/performance" },
  { label: "Favourite Teams", icon: "star-outline", route: "/favourites" },
  { label: "Settings", icon: "settings-outline", route: "/settings" },
];

export default function ProfileScreen() {
  const { balance, bets } = useApp();
  const settled = useMemo(() => bets.filter((b) => b.status !== "pending"), [bets]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="items-center pt-6 pb-5">
          <View className="w-20 h-20 rounded-full bg-edge items-center justify-center mb-3">
            <Text className="text-white font-sans-bold text-[26px]">GM</Text>
          </View>
          <Text className="font-sans-bold text-[19px] text-text-primary">Guest Manager</Text>
          <Text className="text-text-tertiary text-[12.5px] mt-1">Starting balance: {formatCurrency(STARTING_BALANCE)}</Text>
        </View>

        <View className="px-5 flex-row gap-3 mb-6">
          <Card className="flex-1 p-4 items-center">
            <Text className="text-text-secondary text-[11.5px]">Virtual bankroll</Text>
            <MonoText className="text-text-primary text-[18px] font-mono-bold mt-1">{formatCurrency(balance)}</MonoText>
          </Card>
          <Card className="flex-1 p-4 items-center">
            <Text className="text-text-secondary text-[11.5px]">Simulation record</Text>
            <MonoText className="text-text-primary text-[18px] font-mono-bold mt-1">{bets.length} bets</MonoText>
          </Card>
        </View>

        <View className="px-5">
          <Card className="overflow-hidden">
            {MENU.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route as never)}
                className={`flex-row items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-surfaceInset items-center justify-center">
                    <Ionicons name={item.icon} size={16} color={colors.textSecondary} />
                  </View>
                  <Text className="text-text-primary text-[14px] font-sans-medium">{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </Pressable>
            ))}
          </Card>
        </View>

        {settled.length > 0 ? (
          <View className="px-5 mt-5">
            <Text className="text-text-tertiary text-[12px] text-center">
              {settled.filter((b) => b.status === "won").length} won · {settled.filter((b) => b.status === "lost").length} lost
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
