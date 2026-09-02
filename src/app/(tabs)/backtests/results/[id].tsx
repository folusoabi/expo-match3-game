import React from "react";
import { View, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text, MonoText } from "@/components/ui/Text";
import { StatRow } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { EquityChart } from "@/components/ui/EquityChart";
import { SportTag } from "@/components/ui/SportTag";
import { ErrorState } from "@/components/ui/States";
import { useBacktestStore } from "@/state/BacktestProvider";
import { formatCurrency, formatDate, formatOdds, formatPercent } from "@/utils/format";
import { LEAGUES } from "@/data/mock/reference";

export default function BacktestResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getResultById, strategies } = useBacktestStore();
  const result = getResultById(id);

  if (!result) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <ScreenHeader title="Results" showBack />
        <ErrorState message="This backtest result could not be found." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  const strategy = strategies.find((s) => s.config.id === result.strategyId);
  const league = strategy ? LEAGUES.find((l) => l.id === strategy.config.leagueId) : undefined;
  const positive = result.profit >= 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title="Backtest Results" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="px-5">
          {strategy ? (
            <View className="flex-row items-center gap-2 mb-1">
              <SportTag sportId={strategy.config.sportId} label={league?.name} />
            </View>
          ) : null}
          <Text className="font-sans-bold text-[19px] mt-1">{strategy?.config.name ?? "Backtest"}</Text>
          <Text className="text-text-tertiary text-xs mt-1">
            {formatDate(result.bets[0]?.date ?? result.generatedAt)} — {formatDate(result.bets[result.bets.length - 1]?.date ?? result.generatedAt)}
          </Text>

          <Card raised className="mt-4 p-5 items-center">
            <Text className="text-text-secondary text-[13px]">Net profit</Text>
            <MonoText className={`text-[34px] font-mono-bold mt-1 ${positive ? "text-profit" : "text-loss"}`}>
              {formatCurrency(result.profit, { showSign: true })}
            </MonoText>
            <View className="flex-row gap-5 mt-3">
              <View className="items-center">
                <Text className="text-text-tertiary text-[11px]">ROI</Text>
                <MonoText className={`text-[14px] font-mono-medium mt-0.5 ${positive ? "text-profit" : "text-loss"}`}>
                  {formatPercent(result.roi, { showSign: true })}
                </MonoText>
              </View>
              <View className="items-center">
                <Text className="text-text-tertiary text-[11px]">Win rate</Text>
                <MonoText className="text-[14px] font-mono-medium mt-0.5">{formatPercent(result.winRate)}</MonoText>
              </View>
              <View className="items-center">
                <Text className="text-text-tertiary text-[11px]">Bets</Text>
                <MonoText className="text-[14px] font-mono-medium mt-0.5">{result.totalBets}</MonoText>
              </View>
            </View>
          </Card>

          <Card className="mt-4 p-4">
            <Text className="font-sans-semibold text-[14px] mb-1">Bankroll curve</Text>
            <EquityChart data={result.equityCurve} startingBankroll={result.startingBankroll} />
          </Card>

          <Text className="font-sans-semibold text-[15px] mt-6 mb-2">Bet summary</Text>
          <Card className="px-4">
            <StatRow label="Total bets" value={String(result.totalBets)} />
            <StatRow label="Wins" value={String(result.wins)} tone="profit" />
            <StatRow label="Losses" value={String(result.losses)} tone="loss" />
            <StatRow label="Voids / pushes" value={String(result.voids)} />
            <StatRow label="Win rate" value={formatPercent(result.winRate)} />
            <StatRow label="Average odds" value={formatOdds(result.averageOdds)} isLast />
          </Card>

          <Text className="font-sans-semibold text-[15px] mt-6 mb-2">Bankroll</Text>
          <Card className="px-4">
            <StatRow label="Starting bankroll" value={formatCurrency(result.startingBankroll)} />
            <StatRow label="Final bankroll" value={formatCurrency(result.finalBankroll)} />
            <StatRow label="Total staked" value={formatCurrency(result.totalStaked)} />
            <StatRow
              label="Profit / loss"
              value={formatCurrency(result.profit, { showSign: true })}
              tone={positive ? "profit" : "loss"}
            />
            <StatRow label="ROI" value={formatPercent(result.roi, { showSign: true })} tone={positive ? "profit" : "loss"} isLast />
          </Card>

          <Text className="font-sans-semibold text-[15px] mt-6 mb-2">Risk</Text>
          <Card className="px-4">
            <StatRow label="Maximum drawdown" value={formatPercent(result.maxDrawdown)} tone="warn" />
            <StatRow label="Max drawdown (amount)" value={formatCurrency(result.maxDrawdownAmount)} tone="warn" />
            <StatRow label="Longest winning streak" value={`${result.longestWinStreak} bets`} tone="profit" />
            <StatRow label="Longest losing streak" value={`${result.longestLossStreak} bets`} tone="loss" isLast />
          </Card>

          <View className="mt-6">
            <Button
              label="View Match History"
              icon="list-outline"
              variant="secondary"
              fullWidth
              onPress={() => router.push(`/(tabs)/backtests/history/${result.id}`)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
