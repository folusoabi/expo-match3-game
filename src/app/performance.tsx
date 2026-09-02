import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { StatCard, StatRow } from "@/components/ui/StatCard";
import { EquityChart } from "@/components/ui/EquityChart";
import { formatCurrency, formatPercent } from "@/utils/format";
import { useApp, STARTING_BALANCE } from "@/state/AppProvider";
import type { EquityPoint } from "@/types";

export default function PerformanceScreen() {
  const { balance, bets, transactions } = useApp();

  const stats = useMemo(() => {
    const settled = bets.filter((b) => b.status !== "pending");
    const wins = settled.filter((b) => b.status === "won").length;
    const losses = settled.filter((b) => b.status === "lost").length;
    const winRate = wins + losses > 0 ? wins / (wins + losses) : 0;
    const totalStaked = bets.reduce((s, b) => s + b.stake, 0);
    const profit = balance - STARTING_BALANCE;
    const roi = totalStaked > 0 ? profit / totalStaked : 0;
    return { totalBets: bets.length, wins, losses, winRate, profit, roi };
  }, [bets, balance]);

  const equityCurve: EquityPoint[] = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const points: EquityPoint[] = [{ index: 0, date: sorted[0]?.createdAt ?? new Date().toISOString(), bankroll: STARTING_BALANCE }];
    sorted.forEach((t, i) => points.push({ index: i + 1, date: t.createdAt, bankroll: t.balanceAfter }));
    return points;
  }, [transactions]);

  const positive = stats.profit >= 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title="Performance" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-5">
          <Card raised className="p-4 mb-4">
            <EquityChart data={equityCurve} startingBankroll={STARTING_BALANCE} />
          </Card>

          <View className="flex-row gap-3">
            <StatCard label="Current bankroll" value={formatCurrency(balance)} className="flex-1" />
            <StatCard
              label="Profit"
              value={formatCurrency(stats.profit, { showSign: true })}
              tone={positive ? "profit" : "loss"}
              className="flex-1"
            />
          </View>
          <View className="flex-row gap-3 mt-3">
            <StatCard
              label="ROI"
              value={formatPercent(stats.roi, { showSign: true })}
              tone={positive ? "profit" : "loss"}
              className="flex-1"
            />
            <StatCard label="Win rate" value={formatPercent(stats.winRate)} className="flex-1" />
          </View>

          <View className="h-2" />

          <Card className="px-4 mt-2">
            <StatRow label="Starting bankroll" value={formatCurrency(STARTING_BALANCE)} />
            <StatRow label="Current bankroll" value={formatCurrency(balance)} />
            <StatRow label="Total bets" value={String(stats.totalBets)} />
            <StatRow label="Wins" value={String(stats.wins)} tone="profit" />
            <StatRow label="Losses" value={String(stats.losses)} tone="loss" isLast />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
