import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { Text, MonoText } from "./ui/Text";
import { SportTag } from "./ui/SportTag";
import { colors } from "@/constants/theme";
import { formatCurrency, formatDate, formatPercent } from "@/utils/format";
import type { BacktestResult, SavedStrategy } from "@/types";
import { LEAGUES } from "@/data/mock/reference";

export function BacktestResultRow({
  result,
  title,
  onPress,
}: {
  result: BacktestResult;
  title: string;
  onPress: () => void;
}) {
  const positive = result.profit >= 0;
  const sportId = result.bets[0]?.sportId;
  return (
    <Pressable onPress={onPress}>
      <Card className="p-4 mb-2.5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            {sportId ? <SportTag sportId={sportId} /> : null}
            <Text className="font-sans-semibold text-[14.5px] mt-2" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-text-tertiary text-xs mt-1">
              {result.totalBets} bets · {formatDate(result.generatedAt)}
            </Text>
          </View>
          <View className="items-end">
            <MonoText className={`font-mono-medium text-[15px] ${positive ? "text-profit" : "text-loss"}`}>
              {formatCurrency(result.profit, { showSign: true })}
            </MonoText>
            <Text className={`text-xs mt-0.5 ${positive ? "text-profit" : "text-loss"}`}>
              {formatPercent(result.roi, { showSign: true })} ROI
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export function StrategyRow({ strategy, onPress }: { strategy: SavedStrategy; onPress: () => void }) {
  const league = LEAGUES.find((l) => l.id === strategy.config.leagueId);
  const r = strategy.lastResult;
  const positive = (r?.profit ?? 0) >= 0;
  return (
    <Pressable onPress={onPress}>
      <Card className="p-4 mb-2.5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <SportTag sportId={strategy.config.sportId} label={league?.shortName} />
            <Text className="font-sans-semibold text-[14.5px] mt-2" numberOfLines={1}>
              {strategy.config.name}
            </Text>
            <Text className="text-text-tertiary text-xs mt-1" numberOfLines={1}>
              {strategy.config.selection}
              {strategy.config.line !== undefined ? ` ${strategy.config.line}` : ""} · {strategy.config.bookmaker}
            </Text>
          </View>
          <View className="items-end">
            {r ? (
              <>
                <MonoText className={`font-mono-medium text-[15px] ${positive ? "text-profit" : "text-loss"}`}>
                  {formatPercent(r.roi, { showSign: true })}
                </MonoText>
                <Text className="text-text-tertiary text-xs mt-0.5">{r.totalBets} bets</Text>
              </>
            ) : (
              <View className="flex-row items-center gap-1">
                <Ionicons name="play-circle-outline" size={14} color={colors.textTertiary} />
                <Text className="text-text-tertiary text-xs">Not run</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
