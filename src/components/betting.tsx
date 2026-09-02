import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { Text, MonoText } from "./ui/Text";
import { colors } from "@/constants/theme";
import { formatCurrency, formatOdds } from "@/utils/format";
import type { BetSlipSelection, PlacedBet, Selection } from "@/types";

export function OddsButton({ selection, active, onPress }: { selection: Selection; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center rounded-xl py-2.5 border ${active ? "bg-edge border-edge" : "bg-surfaceInset border-border"}`}
    >
      <Text className={`text-[11.5px] font-sans-medium ${active ? "text-white/85" : "text-text-secondary"}`} numberOfLines={1}>
        {selection.label}
      </Text>
      <MonoText className={`text-[14.5px] font-mono-medium mt-0.5 ${active ? "text-white" : "text-text-primary"}`}>
        {formatOdds(selection.odds)}
      </MonoText>
    </Pressable>
  );
}

export function MarketSectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 mb-3">
      <Text className="text-text-primary font-sans-bold text-[14.5px] mb-3">{title}</Text>
      {children}
    </Card>
  );
}

export function SlipSelectionCard({ selection, onRemove }: { selection: BetSlipSelection; onRemove: () => void }) {
  return (
    <Card className="p-3.5 mb-2.5">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-text-tertiary text-[11px] font-sans-medium" numberOfLines={1}>
            {selection.competitionName}
          </Text>
          <Text className="text-text-primary font-sans-semibold text-[13.5px] mt-1" numberOfLines={1}>
            {selection.eventLabel}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Text className="text-edge text-[12.5px] font-sans-semibold" numberOfLines={1}>
              {selection.selectionLabel}
            </Text>
            <Text className="text-text-tertiary text-[11px]">· {selection.marketName}</Text>
          </View>
        </View>
        <View className="items-end gap-2">
          <MonoText className="text-text-primary text-[14px] font-mono-medium">{formatOdds(selection.odds)}</MonoText>
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export function BetHistoryRow({ bet, onPress }: { bet: PlacedBet; onPress: () => void }) {
  const isMulti = bet.selections.length > 1;
  const label = isMulti ? `${bet.selections.length}-Fold Accumulator` : bet.selections[0]?.eventLabel;
  const sub = isMulti
    ? bet.selections.map((s) => s.selectionLabel).join(" · ")
    : `${bet.selections[0]?.selectionLabel} · ${bet.selections[0]?.marketName}`;

  const statusTone = bet.status === "won" ? "text-profit" : bet.status === "lost" ? "text-loss" : "text-edge";
  const statusBg = bet.status === "won" ? "bg-profit/10" : bet.status === "lost" ? "bg-loss/10" : "bg-edge/10";
  const statusLabel = bet.status === "won" ? "Won" : bet.status === "lost" ? "Lost" : "Pending";

  return (
    <Pressable onPress={onPress}>
      <Card className="p-3.5 mb-2.5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-text-primary font-sans-semibold text-[13.5px]" numberOfLines={1}>
              {label}
            </Text>
            <Text className="text-text-tertiary text-[11.5px] mt-1" numberOfLines={1}>
              {sub}
            </Text>
            <Text className="text-text-tertiary text-[11px] mt-1.5">Stake {formatCurrency(bet.stake)}</Text>
          </View>
          <View className="items-end gap-1.5">
            <View className={`rounded-pill px-2.5 py-1 ${statusBg}`}>
              <Text className={`text-[11px] font-sans-bold ${statusTone}`}>{statusLabel}</Text>
            </View>
            {bet.status !== "pending" ? (
              <MonoText className={`text-[13px] font-mono-medium ${statusTone}`}>
                {bet.status === "won" ? "+" : ""}
                {formatCurrency(bet.profit ?? 0)}
              </MonoText>
            ) : (
              <MonoText className="text-text-secondary text-[13px] font-mono-medium">{formatOdds(bet.combinedOdds)}</MonoText>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export function ResultBanner({ status, profit }: { status: "won" | "lost"; profit: number }) {
  const won = status === "won";
  return (
    <View className={`items-center rounded-2xl py-6 ${won ? "bg-profit/10" : "bg-loss/10"}`}>
      <View className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${won ? "bg-profit" : "bg-loss"}`}>
        <Ionicons name={won ? "checkmark" : "close"} size={28} color="#fff" />
      </View>
      <Text className={`font-sans-bold text-[20px] ${won ? "text-profit" : "text-loss"}`}>{won ? "WIN" : "LOSS"}</Text>
      <MonoText className={`font-mono-bold text-[24px] mt-1 ${won ? "text-profit" : "text-loss"}`}>
        {won ? "+" : "-"}
        {formatCurrency(Math.abs(profit))}
      </MonoText>
    </View>
  );
}
