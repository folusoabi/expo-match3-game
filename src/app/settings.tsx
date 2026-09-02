import React from "react";
import { View, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { StatRow } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/format";
import { useApp, STARTING_BALANCE } from "@/state/AppProvider";
import { getDatasetRange, getAllMatches } from "@/data/mock/eventGenerator";
import { COMPETITIONS } from "@/data/mock/reference";

export default function SettingsScreen() {
  const { resetAll } = useApp();
  const range = getDatasetRange();
  const totalMatches = getAllMatches().length;

  function handleReset() {
    Alert.alert(
      "Reset simulation",
      `This resets your virtual balance back to $${STARTING_BALANCE.toLocaleString()} and clears all bet history. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetAll },
      ]
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title="Settings" showBack onBack={() => router.back()} />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Card className="px-4">
          <StatRow label="Dataset range" value={`${formatDate(range.from)} – ${formatDate(range.to)}`} />
          <StatRow label="Simulated matches" value={totalMatches.toLocaleString()} />
          <StatRow label="Competitions" value={String(COMPETITIONS.length)} />
          <StatRow label="Starting balance" value={`$${STARTING_BALANCE.toLocaleString()}`} isLast />
        </Card>
        <View className="px-1 mt-2">
          <Text className="text-text-tertiary text-xs leading-5">
            All matches, odds, and results are generated locally from a deterministic dataset — no live sports or
            odds API is connected. This is a historical simulation only; nothing here is real-money gambling.
          </Text>
        </View>

        <View className="mt-7">
          <Button label="Reset Simulation" variant="danger" icon="refresh-outline" fullWidth onPress={handleReset} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
