import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text, MonoText } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { DatePager } from "@/components/ui/DatePager";
import { EmptyState } from "@/components/ui/States";
import { CompetitionSection } from "@/components/matches";
import { colors } from "@/constants/theme";
import { formatCurrency, formatDate } from "@/utils/format";
import { useApp } from "@/state/AppProvider";
import { COMPETITIONS } from "@/data/mock/reference";
import { getMatchesForDate, getDatesWithMatchesInRange, DATASET_FROM, TODAY } from "@/data/mock/eventGenerator";

export default function HomeScreen() {
  const { balance, exploreDate, setExploreDate } = useApp();
  const [date, setDate] = useState(exploreDate);

  const profit = balance - 5000;
  const positive = profit >= 0;

  const matchesToday = useMemo(() => getMatchesForDate(date), [date]);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof matchesToday>();
    for (const m of matchesToday) {
      const arr = map.get(m.competitionId) ?? [];
      arr.push(m);
      map.set(m.competitionId, arr);
    }
    return Array.from(map.entries())
      .map(([id, matches]) => ({ competition: COMPETITIONS.find((c) => c.id === id)!, matches }))
      .filter((g) => g.competition);
  }, [matchesToday]);

  const datesWithMatches = useMemo(
    () => getDatesWithMatchesInRange(addDays(date, -10), addDays(date, 10)),
    [date]
  );

  function selectDate(d: string) {
    setDate(d);
    setExploreDate(d);
  }

  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
          <Text className="font-sans-bold text-[22px] text-text-primary">Rewind</Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push("/search")}
              className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
            >
              <Ionicons name="search" size={18} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              className="w-10 h-10 rounded-full bg-edge items-center justify-center"
            >
              <Text className="text-white font-sans-bold text-[14px]">GM</Text>
            </Pressable>
          </View>
        </View>

        <View className="px-5">
          <Card raised className="p-5">
            <Text className="text-text-secondary text-[12.5px] font-sans-medium">Virtual balance</Text>
            <MonoText className="text-[32px] font-mono-bold text-text-primary mt-1">{formatCurrency(balance)}</MonoText>
            <View className="flex-row items-center gap-1.5 mt-2">
              <Ionicons name={positive ? "trending-up" : "trending-down"} size={14} color={positive ? colors.profit : colors.loss} />
              <Text className={`text-[13px] font-sans-semibold ${positive ? "text-profit" : "text-loss"}`}>
                {positive ? "+" : ""}
                {formatCurrency(profit)}
              </Text>
              <Text className="text-text-tertiary text-[12px]">since $5,000 start</Text>
            </View>
          </Card>
        </View>

        <View className="px-5 mt-6">
          <Text className="font-sans-semibold text-[16px] mb-1">Continue Simulation</Text>
          <Text className="text-text-secondary text-[13px] mb-3">You're exploring {formatDate(date)}</Text>
        </View>

        <View className="mb-2">
          <View className="px-5 mb-2 flex-row items-center justify-between">
            <Text className="text-text-secondary text-[12.5px] font-sans-medium">Explore history</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {years.map((y) => {
              const active = date.startsWith(String(y));
              return (
                <Pressable
                  key={y}
                  onPress={() => selectDate(nearestDateInYear(date, y))}
                  className={`rounded-pill px-4 py-2 border ${active ? "bg-text-primary border-text-primary" : "bg-surface border-border"}`}
                >
                  <Text className={`text-[13px] font-sans-bold ${active ? "text-white" : "text-text-secondary"}`}>{y}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="mt-4 mb-3">
          <DatePager selected={date} onSelect={selectDate} datesWithMatches={datesWithMatches} />
        </View>

        <View className="px-5">
          <Text className="font-sans-semibold text-[16px] mb-3">Today in history</Text>
          {grouped.length === 0 ? (
            <Card>
              <EmptyState
                icon="calendar-outline"
                title="No matches this day"
                message="Try a nearby date — the dots on the date strip show days with fixtures."
              />
            </Card>
          ) : (
            grouped.map((g) => (
              <CompetitionSection
                key={g.competition.id}
                competition={g.competition}
                matches={g.matches}
                onSelectMatch={(m) => router.push(`/match/${m.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const clamped = d.toISOString().slice(0, 10);
  return clamped < DATASET_FROM ? DATASET_FROM : clamped > TODAY ? TODAY : clamped;
}

function nearestDateInYear(currentDate: string, year: number): string {
  const [, m, d] = currentDate.split("-");
  const candidate = `${year}-${m}-${d}`;
  if (candidate < DATASET_FROM) return DATASET_FROM;
  if (candidate > TODAY) return TODAY;
  return candidate;
}
