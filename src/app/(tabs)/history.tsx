import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { BetHistoryRow } from "@/components/betting";
import { useApp } from "@/state/AppProvider";
import type { SportId } from "@/types";

type Filter = "all" | "won" | "lost" | "pending" | "accumulators" | SportId;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Wins", value: "won" },
  { label: "Losses", value: "lost" },
  { label: "Pending", value: "pending" },
  { label: "Accumulators", value: "accumulators" },
  { label: "Football", value: "football" },
  { label: "Basketball", value: "basketball" },
  { label: "Hockey", value: "hockey" },
  { label: "Tennis", value: "tennis" },
];

export default function HistoryScreen() {
  const { bets } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    return bets.filter((b) => {
      if (filter === "all") return true;
      if (filter === "won" || filter === "lost" || filter === "pending") return b.status === filter;
      if (filter === "accumulators") return b.selections.length > 1;
      return b.selections.some((s) => s.sportId === filter);
    });
  }, [bets, filter]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <View className="px-5 pt-2 pb-3">
        <Text className="font-sans-bold text-[22px] text-text-primary">History</Text>
        <Text className="text-text-secondary text-[13px] mt-0.5">{bets.length} simulated bets placed</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }} className="mb-3">
        {FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              className={`rounded-pill px-3.5 py-2 border ${active ? "bg-text-primary border-text-primary" : "bg-surface border-border"}`}
            >
              <Text className={`text-[12.5px] font-sans-semibold ${active ? "text-white" : "text-text-secondary"}`}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon="time-outline"
              title="No bets here yet"
              message="Placed simulated predictions will show up in this list."
              actionLabel="Browse Sports"
              onAction={() => router.push("/(tabs)/sports")}
            />
          </Card>
        ) : (
          filtered.map((b) => <BetHistoryRow key={b.id} bet={b} onPress={() => router.push(`/bet/${b.id}`)} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
