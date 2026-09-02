import React, { useMemo } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text, MonoText } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { BacktestResultRow, StrategyRow } from "@/components/cards";
import { colors } from "@/constants/theme";
import { formatCurrency, formatPercent } from "@/utils/format";
import { useBacktestStore } from "@/state/BacktestProvider";
import { LEAGUES } from "@/data/mock/reference";

export default function DashboardScreen() {
  const { recentResults, strategies, hydrated } = useBacktestStore();

  const totals = useMemo(() => {
    const totalBacktests = recentResults.length;
    const betsTested = recentResults.reduce((s, r) => s + r.totalBets, 0);
    const totalStaked = recentResults.reduce((s, r) => s + r.totalStaked, 0);
    const profit = recentResults.reduce((s, r) => s + r.profit, 0);
    const roi = totalStaked > 0 ? profit / totalStaked : 0;
    return { totalBacktests, betsTested, profit, roi };
  }, [recentResults]);

  if (!hydrated) return null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-5 pt-3 pb-1">
          <View>
            <Text className="text-text-tertiary text-[12.5px] font-sans-medium">Edge Terminal</Text>
            <Text className="font-sans-bold text-[24px] text-text-primary mt-0.5">Dashboard</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-surfaceRaised border border-border items-center justify-center">
            <Ionicons name="pulse-outline" size={18} color={colors.edge} />
          </View>
        </View>

        <View className="px-5 mt-5">
          <View className="flex-row gap-3">
            <StatCard label="Backtests run" value={String(totals.totalBacktests)} className="flex-1" />
            <StatCard label="Bets tested" value={totals.betsTested.toLocaleString()} className="flex-1" />
          </View>
          <View className="flex-row gap-3 mt-3">
            <StatCard
              label="Overall ROI"
              value={formatPercent(totals.roi, { showSign: true })}
              tone={totals.roi >= 0 ? "profit" : "loss"}
              className="flex-1"
            />
            <StatCard
              label="Total profit"
              value={formatCurrency(totals.profit, { showSign: true })}
              tone={totals.profit >= 0 ? "profit" : "loss"}
              className="flex-1"
            />
          </View>
        </View>

        <View className="px-5 mt-5">
          <Button
            label="Create Backtest"
            icon="add-circle"
            fullWidth
            onPress={() => router.push("/(tabs)/backtests/builder")}
          />
        </View>

        <View className="px-5 mt-7">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-sans-semibold text-[16px]">Recent backtests</Text>
            {recentResults.length > 0 ? (
              <Pressable onPress={() => router.push("/(tabs)/backtests")}>
                <Text className="text-edge text-[13px] font-sans-medium">See all</Text>
              </Pressable>
            ) : null}
          </View>
          {recentResults.length === 0 ? (
            <Card>
              <EmptyState
                icon="analytics-outline"
                title="No backtests yet"
                message="Configure a strategy and run it against historical data to see results here."
                actionLabel="Create Backtest"
                onAction={() => router.push("/(tabs)/backtests/builder")}
              />
            </Card>
          ) : (
            recentResults.slice(0, 4).map((r) => {
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
        </View>

        <View className="px-5 mt-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-sans-semibold text-[16px]">Saved strategies</Text>
            {strategies.length > 0 ? (
              <Pressable onPress={() => router.push("/(tabs)/strategies")}>
                <Text className="text-edge text-[13px] font-sans-medium">See all</Text>
              </Pressable>
            ) : null}
          </View>
          {strategies.length === 0 ? (
            <Card>
              <EmptyState icon="bookmark-outline" title="No saved strategies" message="Save a backtest configuration to quickly rerun it later." />
            </Card>
          ) : (
            strategies.slice(0, 3).map((s) => (
              <StrategyRow key={s.config.id} strategy={s} onPress={() => router.push(`/(tabs)/strategies/${s.config.id}`)} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
