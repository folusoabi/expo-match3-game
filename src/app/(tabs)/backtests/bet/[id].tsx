import React from "react";
import { View, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text, MonoText } from "@/components/ui/Text";
import { StatRow } from "@/components/ui/StatCard";
import { ResultBadge } from "@/components/ui/Badge";
import { SportTag } from "@/components/ui/SportTag";
import { ErrorState } from "@/components/ui/States";
import { useBacktestStore } from "@/state/BacktestProvider";
import { formatCurrency, formatDate, formatOdds } from "@/utils/format";
import { getEventById } from "@/data/mock/eventGenerator";

export default function BetDetailScreen() {
  const { id, resultId } = useLocalSearchParams<{ id: string; resultId: string }>();
  const { getResultById } = useBacktestStore();
  const result = getResultById(resultId);
  const bet = result?.bets.find((b) => b.id === id);

  if (!result || !bet) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <ScreenHeader title="Bet Detail" showBack />
        <ErrorState message="This bet could not be found." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  const event = getEventById(bet.eventId);
  const positive = bet.profit > 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title="Bet Detail" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-5">
          <View className="flex-row items-center justify-between">
            <SportTag sportId={bet.sportId} label={bet.leagueName} />
            <ResultBadge result={bet.result} />
          </View>

          <Text className="font-sans-bold text-[19px] mt-3">{bet.eventLabel}</Text>
          <Text className="text-text-tertiary text-xs mt-1">{formatDate(bet.date)}</Text>

          {event ? (
            <Card className="mt-4 p-4 items-center">
              <Text className="text-text-secondary text-[12px] mb-2">Final result</Text>
              <View className="flex-row items-center gap-6">
                <View className="items-center">
                  <Text className="font-sans-medium text-[13px]" numberOfLines={1}>
                    {event.home.name}
                  </Text>
                  <MonoText className="text-[26px] font-mono-bold mt-1">{event.result.homeScore}</MonoText>
                </View>
                <Text className="text-text-tertiary text-[13px]">vs</Text>
                <View className="items-center">
                  <Text className="font-sans-medium text-[13px]" numberOfLines={1}>
                    {event.away.name}
                  </Text>
                  <MonoText className="text-[26px] font-mono-bold mt-1">{event.result.awayScore}</MonoText>
                </View>
              </View>
              {event.result.sets ? (
                <Text className="text-text-tertiary text-xs mt-3">
                  Sets: {event.result.sets.map((s) => `${s.home}-${s.away}`).join(", ")}
                </Text>
              ) : null}
            </Card>
          ) : null}

          <Text className="font-sans-semibold text-[15px] mt-6 mb-2">Wager</Text>
          <Card className="px-4">
            <StatRow label="Market" value={bet.marketName} />
            <StatRow label="Selection" value={bet.selection} />
            <StatRow label="Odds" value={formatOdds(bet.odds)} />
            <StatRow label="Bookmaker" value={bet.bookmaker} />
            <StatRow label="Stake" value={formatCurrency(bet.stake)} isLast />
          </Card>

          <Text className="font-sans-semibold text-[15px] mt-6 mb-2">Outcome</Text>
          <Card className="px-4">
            <StatRow
              label="Result"
              value={bet.result === "won" ? "Won" : bet.result === "lost" ? "Lost" : "Void"}
              tone={bet.result === "won" ? "profit" : bet.result === "lost" ? "loss" : "neutral"}
            />
            <StatRow
              label="Profit / loss"
              value={formatCurrency(bet.profit, { showSign: true })}
              tone={positive ? "profit" : bet.profit < 0 ? "loss" : "neutral"}
            />
            <StatRow label="Bankroll after" value={formatCurrency(bet.bankrollAfter)} isLast />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
