import React from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { BacktestResultRow } from "@/components/cards";
import { useBacktestStore } from "@/state/BacktestProvider";
import { LEAGUES } from "@/data/mock/reference";

export default function BacktestsListScreen() {
  const { recentResults, strategies, hydrated } = useBacktestStore();

  if (!hydrated) return null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader
        title="Backtests"
        subtitle={`${recentResults.length} run${recentResults.length === 1 ? "" : "s"}`}
        right={
          <Button label="New" icon="add" size="sm" onPress={() => router.push("/(tabs)/backtests/builder")} />
        }
      />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {recentResults.length === 0 ? (
          <Card>
            <EmptyState
              icon="analytics-outline"
              title="No backtests yet"
              message="Build a strategy and run it against Football, Basketball, Hockey, or Tennis history."
              actionLabel="Create Backtest"
              onAction={() => router.push("/(tabs)/backtests/builder")}
            />
          </Card>
        ) : (
          recentResults.map((r) => {
            const strategy = strategies.find((s) => s.config.id === r.strategyId);
            const league = strategy ? LEAGUES.find((l) => l.id === strategy.config.leagueId) : undefined;
            return (
              <BacktestResultRow
                key={r.id}
                result={r}
                title={strategy?.config.name ?? league?.name ?? "Backtest"}
                onPress={() => router.push(`/(tabs)/backtests/results/${r.id}`)}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
