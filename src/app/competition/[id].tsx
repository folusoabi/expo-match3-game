import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { DatePager } from "@/components/ui/DatePager";
import { YearMonthPicker } from "@/components/ui/YearMonthPicker";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { MatchRow } from "@/components/matches";
import { colors } from "@/constants/theme";
import { formatDate } from "@/utils/format";
import { COMPETITIONS } from "@/data/mock/reference";
import { getMatchesForCompetitionAndDate, getDatesWithMatchesInRange, getMatchDatesInMonth, DATASET_FROM, TODAY } from "@/data/mock/eventGenerator";

export default function CompetitionScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const competition = COMPETITIONS.find((c) => c.id === id);
  const [date, setDate] = useState("2023-09-17");
  const [pickerOpen, setPickerOpen] = useState(false);

  const matches = useMemo(() => (competition ? getMatchesForCompetitionAndDate(competition.id, date) : []), [competition, date]);
  const datesWithMatches = useMemo(
    () => (competition ? getDatesWithMatchesInRange(addDays(date, -10), addDays(date, 10)) : new Set<string>()),
    [competition, date]
  );

  if (!competition) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <ScreenHeader title="Competition" showBack />
        <ErrorState message="This competition could not be found." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  function jumpToNearestMatch(direction: 1 | -1) {
    let cursor = date;
    for (let i = 0; i < 60; i++) {
      cursor = addDays(cursor, direction * 10);
      if (getMatchesForCompetitionAndDate(competition!.id, cursor).length > 0) {
        setDate(cursor);
        return;
      }
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title={competition.name} subtitle={competition.country} showBack onBack={() => router.back()} />

      <View className="px-5 mb-3 flex-row items-center gap-2">
        <Pressable
          onPress={() => setPickerOpen(true)}
          className="flex-row items-center gap-1.5 bg-surface border border-border rounded-pill px-3.5 py-2"
        >
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text className="text-text-secondary text-[12.5px] font-sans-medium">{formatDate(date)}</Text>
        </Pressable>
        <Pressable onPress={() => jumpToNearestMatch(-1)} className="w-8 h-8 rounded-full bg-surface border border-border items-center justify-center">
          <Ionicons name="chevron-back" size={15} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={() => jumpToNearestMatch(1)} className="w-8 h-8 rounded-full bg-surface border border-border items-center justify-center">
          <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View className="mb-3">
        <DatePager selected={date} onSelect={setDate} datesWithMatches={datesWithMatches} />
      </View>

      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {matches.length === 0 ? (
          <Card>
            <EmptyState
              icon="calendar-outline"
              title="No fixtures this day"
              message="Use the arrows above to jump to the nearest match day."
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {matches.map((m, i) => (
              <View key={m.id} className={i > 0 ? "border-t border-border" : ""}>
                <MatchRow match={m} onPress={() => router.push(`/match/${m.id}`)} />
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <YearMonthPicker
        visible={pickerOpen}
        years={[2020, 2021, 2022, 2023, 2024, 2025, 2026]}
        initialYear={parseInt(date.slice(0, 4), 10)}
        initialMonth={parseInt(date.slice(5, 7), 10)}
        onSelect={(year, month) => {
          const monthDates = getMatchDatesInMonth(competition.id, year, month);
          if (monthDates.length > 0) {
            setDate(monthDates[0]);
          } else {
            setDate(`${year}-${String(month).padStart(2, "0")}-01`);
          }
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const clamped = d.toISOString().slice(0, 10);
  return clamped < DATASET_FROM ? DATASET_FROM : clamped > TODAY ? TODAY : clamped;
}
