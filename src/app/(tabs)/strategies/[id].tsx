import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text, MonoText } from "@/components/ui/Text";
import { StatRow } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { SportTag } from "@/components/ui/SportTag";
import { EquityChart } from "@/components/ui/EquityChart";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useBacktestStore } from "@/state/BacktestProvider";
import { formatCurrency, formatDate, formatPercent } from "@/utils/format";
import { LEAGUES } from "@/data/mock/reference";
import { getMarket } from "@/data/mock/markets";

export default function StrategyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStrategyById, runAndRecord, deleteStrategy } = useBacktestStore();
  const strategy = getStrategyById(id);
  const [running, setRunning] = useState(false);

  if (!strategy) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <ScreenHeader title="Strategy" showBack />
        <ErrorState message="This strategy could not be found." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  const { config, lastResult } = strategy;
  const league = LEAGUES.find((l) => l.id === config.leagueId);
  const market = getMarket(config.marketId);
  const positive = (lastResult?.profit ?? 0) >= 0;

  async function handleRerun() {
    setRunning(true);
    try {
      const result = await runAndRecord(config);
      router.push(`/(tabs)/backtests/results/${result.id}`);
    } finally {
      setRunning(false);
    }
  }

  function handleDelete() {
    Alert.alert("Delete strategy", `Remove "${config.name}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteStrategy(config.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title={config.name} showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="px-5">
          <SportTag sportId={config.sportId} label={league?.name} />

          {lastResult ? (
            <Card raised className="mt-4 p-5 items-center">
              <Text className="text-text-secondary text-[13px]">Net profit (last run)</Text>
              <MonoText className={`text-[30px] font-mono-bold mt-1 ${positive ? "text-profit" : "text-loss"}`}>
                {formatCurrency(lastResult.profit, { showSign: true })}
              </MonoText>
              <Text className={`text-[13px] mt-1 ${positive ? "text-profit" : "text-loss"}`}>
                {formatPercent(lastResult.roi, { showSign: true })} ROI · {lastResult.totalBets} bets
              </Text>
              <View className="w-full mt-4">
                <EquityChart data={lastResult.equityCurve} startingBankroll={lastResult.startingBankroll} height={140} />
              </View>
            </Card>
          ) : (
            <Card className="mt-4">
              <EmptyState icon="play-circle-outline" title="Not run yet" message="Run this strategy to see performance." />
            </Card>
          )}

          <View className="flex-row gap-3 mt-4">
            <Button label={lastResult ? "Rerun" : "Run Now"} icon="play" onPress={handleRerun} loading={running} className="flex-1" />
            {lastResult ? (
              <Button
                label="Match History"
                variant="secondary"
                icon="list-outline"
                onPress={() => router.push(`/(tabs)/backtests/history/${lastResult.id}`)}
                className="flex-1"
              />
            ) : null}
          </View>

          <Text className="font-sans-semibold text-[15px] mt-7 mb-2">Configuration</Text>
          <Card className="px-4">
            <StatRow label="Sport" value={config.sportId[0].toUpperCase() + config.sportId.slice(1)} />
            <StatRow label="League" value={league?.name ?? "—"} />
            <StatRow label="Market" value={market?.name ?? config.marketId} />
            <StatRow label="Selection" value={config.line !== undefined ? `${config.selection} ${config.line > 0 ? "+" : ""}${config.line}` : config.selection} />
            <StatRow label="Bookmaker" value={config.bookmaker} />
            <StatRow label="Date range" value={`${formatDate(config.dateFrom)} – ${formatDate(config.dateTo)}`} isLast />
          </Card>

          <Text className="font-sans-semibold text-[15px] mt-6 mb-2">Bankroll & staking</Text>
          <Card className="px-4">
            <StatRow label="Starting bankroll" value={formatCurrency(config.startingBankroll)} />
            <StatRow
              label="Stake"
              value={config.stakeType === "fixed" ? formatCurrency(config.stakeValue) : `${config.stakeValue}% of bankroll`}
              isLast
            />
          </Card>

          <Text className="font-sans-semibold text-[15px] mt-6 mb-2">Filters</Text>
          <Card className="px-4">
            <StatRow label="Favourite / underdog" value={cap(config.filters.favourite)} />
            <StatRow label="Home / away" value={cap(config.filters.homeAway)} />
            <StatRow label="Recent form" value={cap(config.filters.form)} />
            <StatRow label="Odds range" value={`${config.filters.minOdds.toFixed(2)} – ${config.filters.maxOdds.toFixed(2)}`} isLast />
          </Card>

          {lastResult ? (
            <>
              <Text className="font-sans-semibold text-[15px] mt-6 mb-2">Performance</Text>
              <Card className="px-4">
                <StatRow label="Win rate" value={formatPercent(lastResult.winRate)} />
                <StatRow label="Average odds" value={lastResult.averageOdds.toFixed(2)} />
                <StatRow label="Max drawdown" value={formatPercent(lastResult.maxDrawdown)} tone="warn" />
                <StatRow label="Longest win streak" value={`${lastResult.longestWinStreak} bets`} tone="profit" />
                <StatRow label="Longest loss streak" value={`${lastResult.longestLossStreak} bets`} tone="loss" isLast />
              </Card>
            </>
          ) : null}

          <View className="mt-7">
            <Button label="Delete Strategy" variant="danger" icon="trash-outline" fullWidth onPress={handleDelete} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function cap(s: string): string {
  return s === "any" ? "Any" : s[0].toUpperCase() + s.slice(1);
}
