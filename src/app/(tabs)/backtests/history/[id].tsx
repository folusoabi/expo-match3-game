import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text, MonoText } from "@/components/ui/Text";
import { ResultBadge } from "@/components/ui/Badge";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useBacktestStore } from "@/state/BacktestProvider";
import { formatCurrency, formatDateShort, formatOdds } from "@/utils/format";
import type { BetResult } from "@/types";

type FilterKind = "all" | BetResult;

export default function MatchHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getResultById } = useBacktestStore();
  const result = getResultById(id);
  const [filter, setFilter] = useState<FilterKind>("all");

  if (!result) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <ScreenHeader title="Match History" showBack />
        <ErrorState message="This backtest result could not be found." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  const bets = result.bets.filter((b) => filter === "all" || b.result === filter);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title="Match History" subtitle={`${result.totalBets} simulated bets`} showBack onBack={() => router.back()} />

      <View className="px-5 mb-3">
        <SegmentedControl
          options={[
            { label: "All", value: "all" },
            { label: "Won", value: "won" },
            { label: "Lost", value: "lost" },
            { label: "Void", value: "void" },
          ]}
          value={filter}
          onChange={(v) => setFilter(v as FilterKind)}
        />
      </View>

      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {bets.length === 0 ? (
          <Card>
            <EmptyState icon="list-outline" title="No bets in this filter" />
          </Card>
        ) : (
          bets.map((bet) => (
            <Pressable key={bet.id} onPress={() => router.push(`/(tabs)/backtests/bet/${bet.id}?resultId=${result.id}`)}>
              <Card className="p-3.5 mb-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-text-tertiary text-[11px]">{formatDateShort(bet.date)}</Text>
                      <Text className="text-text-tertiary text-[11px]">·</Text>
                      <Text className="text-text-tertiary text-[11px]" numberOfLines={1}>
                        {bet.marketName}
                      </Text>
                    </View>
                    <Text className="font-sans-semibold text-[13.5px] mt-1" numberOfLines={1}>
                      {bet.eventLabel}
                    </Text>
                    <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
                      {bet.selection} @ {formatOdds(bet.odds)}
                    </Text>
                  </View>
                  <View className="items-end gap-1.5">
                    <ResultBadge result={bet.result} />
                    <MonoText
                      className={`text-[13px] font-mono-medium ${
                        bet.profit > 0 ? "text-profit" : bet.profit < 0 ? "text-loss" : "text-text-tertiary"
                      }`}
                    >
                      {formatCurrency(bet.profit, { showSign: true })}
                    </MonoText>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
