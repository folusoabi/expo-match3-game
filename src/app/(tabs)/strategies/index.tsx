import React from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { StrategyRow } from "@/components/cards";
import { useBacktestStore } from "@/state/BacktestProvider";

export default function StrategiesListScreen() {
  const { strategies, hydrated } = useBacktestStore();

  if (!hydrated) return null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader
        title="Strategies"
        subtitle={`${strategies.length} saved`}
        right={<Button label="New" icon="add" size="sm" onPress={() => router.push("/(tabs)/backtests/builder")} />}
      />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {strategies.length === 0 ? (
          <Card>
            <EmptyState
              icon="bookmark-outline"
              title="No saved strategies"
              message="Strategies you build and run get saved here so you can rerun or tweak them anytime."
              actionLabel="Create Backtest"
              onAction={() => router.push("/(tabs)/backtests/builder")}
            />
          </Card>
        ) : (
          strategies.map((s) => (
            <StrategyRow key={s.config.id} strategy={s} onPress={() => router.push(`/(tabs)/strategies/${s.config.id}`)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
