import React, { useMemo, useState } from "react";
import { View, ScrollView, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { EmptyState } from "@/components/ui/States";
import { colors } from "@/constants/theme";
import { searchTeams } from "@/data/mock/eventGenerator";
import { COMPETITIONS } from "@/data/mock/reference";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchTeams(query), [query]);

  const competitionMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COMPETITIONS.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <View className="px-5 pt-2 pb-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 rounded-full bg-surface border border-border items-center justify-center">
          <Ionicons name="arrow-back" size={19} color={colors.textPrimary} />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 bg-surface border border-border rounded-pill px-3.5 py-2.5">
          <Ionicons name="search" size={16} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search teams, competitions"
            placeholderTextColor={colors.textTertiary}
            autoFocus
            className="flex-1 text-text-primary text-[14px]"
          />
        </View>
      </View>

      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {query.trim() === "" ? (
          <Card>
            <EmptyState icon="search-outline" title="Search Rewind" message="Find teams and competitions from the historical dataset." />
          </Card>
        ) : results.length === 0 && competitionMatches.length === 0 ? (
          <Card>
            <EmptyState icon="search-outline" title="No results" message={`Nothing found for "${query}"`} />
          </Card>
        ) : (
          <>
            {results.length > 0 ? (
              <View className="mb-5">
                <Text className="text-text-tertiary text-[12px] font-sans-semibold uppercase tracking-wide mb-2 px-1">Teams</Text>
                <Card className="overflow-hidden">
                  {results.slice(0, 20).map((t, i) => {
                    const competition = COMPETITIONS.find((c) => c.id === t.competitionId);
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => router.push(`/team/${t.id}`)}
                        className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                      >
                        <TeamAvatar name={t.name} size={30} />
                        <View>
                          <Text className="text-text-primary text-[13.5px] font-sans-medium">{t.name}</Text>
                          <Text className="text-text-tertiary text-[11.5px] mt-0.5">{competition?.country}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </Card>
              </View>
            ) : null}

            {competitionMatches.length > 0 ? (
              <View>
                <Text className="text-text-tertiary text-[12px] font-sans-semibold uppercase tracking-wide mb-2 px-1">Competitions</Text>
                <Card className="overflow-hidden">
                  {competitionMatches.map((c, i) => (
                    <Pressable
                      key={c.id}
                      onPress={() => router.push(`/competition/${c.id}`)}
                      className={`flex-row items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                    >
                      <Text className="text-text-primary text-[13.5px] font-sans-medium">{c.name}</Text>
                      <Text className="text-text-tertiary text-[11.5px]">{c.country}</Text>
                    </Pressable>
                  ))}
                </Card>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
