import React from "react";
import { View, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text, MonoText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { ResultBanner } from "@/components/betting";
import { formatCurrency, formatDate, formatOdds } from "@/utils/format";
import { getMatchById } from "@/data/mock/eventGenerator";
import { useApp } from "@/state/AppProvider";

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBetById, revealBet } = useApp();
  const bet = getBetById(id);

  if (!bet) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <ScreenHeader title="Bet Detail" showBack />
        <ErrorState message="This bet could not be found." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isMulti = bet.selections.length > 1;
  const revealed = bet.status !== "pending";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader
        title={isMulti ? `${bet.selections.length}-Fold Accumulator` : "Single Bet"}
        subtitle={formatDate(bet.placedAt)}
        showBack
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-5">
          {revealed ? (
            <View className="mb-5">
              <ResultBanner status={bet.status as "won" | "lost"} profit={bet.profit ?? 0} />
            </View>
          ) : (
            <Card className="p-5 items-center mb-5">
              <Text className="text-text-secondary text-[13px]">Prediction pending</Text>
              <Text className="text-text-primary font-sans-bold text-[18px] mt-1">Ready to reveal?</Text>
              <Button label="Reveal Result" icon="eye-outline" onPress={() => revealBet(bet.id)} className="mt-4" />
            </Card>
          )}

          <Text className="font-sans-semibold text-[15px] mb-2">Selections</Text>
          {bet.selections.map((s) => {
            const match = getMatchById(s.matchId);
            return (
              <Card key={s.id} className="p-3.5 mb-2.5">
                <Text className="text-text-tertiary text-[11px] font-sans-medium" numberOfLines={1}>
                  {s.competitionName}
                </Text>
                <Text className="text-text-primary font-sans-semibold text-[13.5px] mt-1" numberOfLines={1}>
                  {s.eventLabel}
                </Text>
                <View className="flex-row items-center justify-between mt-1.5">
                  <Text className="text-edge text-[12.5px] font-sans-semibold" numberOfLines={1}>
                    {s.selectionLabel} · {s.marketName}
                  </Text>
                  <MonoText className="text-text-primary text-[13px] font-mono-medium">{formatOdds(s.odds)}</MonoText>
                </View>
                {revealed && match ? (
                  <Text className="text-text-tertiary text-[11.5px] mt-2">
                    Final score: {match.result.homeScore} - {match.result.awayScore}
                  </Text>
                ) : null}
              </Card>
            );
          })}

          <Text className="font-sans-semibold text-[15px] mt-5 mb-2">Bet summary</Text>
          <Card className="px-4">
            <View className="flex-row items-center justify-between py-2.5 border-b border-border">
              <Text className="text-text-secondary text-[13px]">Combined odds</Text>
              <MonoText className="text-text-primary text-[13px] font-mono-medium">{formatOdds(bet.combinedOdds)}</MonoText>
            </View>
            <View className="flex-row items-center justify-between py-2.5 border-b border-border">
              <Text className="text-text-secondary text-[13px]">Stake</Text>
              <MonoText className="text-text-primary text-[13px] font-mono-medium">{formatCurrency(bet.stake)}</MonoText>
            </View>
            <View className="flex-row items-center justify-between py-2.5">
              <Text className="text-text-secondary text-[13px]">Potential return</Text>
              <MonoText className="text-text-primary text-[13px] font-mono-medium">{formatCurrency(bet.potentialReturn)}</MonoText>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
