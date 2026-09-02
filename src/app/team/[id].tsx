import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text, MonoText } from "@/components/ui/Text";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { EmptyState } from "@/components/ui/States";
import { colors } from "@/constants/theme";
import { formatDate } from "@/utils/format";
import { findTeamById, getTeamMatches } from "@/data/mock/eventGenerator";
import { COMPETITIONS } from "@/data/mock/reference";
import { useApp } from "@/state/AppProvider";

export default function TeamProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = findTeamById(id);
  const { favouriteTeamIds, toggleFavouriteTeam } = useApp();
  const [showCount, setShowCount] = useState(15);

  const matches = useMemo(() => (team ? getTeamMatches(team.id) : []), [team]);
  const recentForm = useMemo(() => {
    return matches.slice(0, 5).map((m) => {
      const isHome = m.home.id === team!.id;
      const hs = m.result.homeScore;
      const as = m.result.awayScore;
      if (hs === as) return "D" as const;
      const homeWon = hs > as;
      return (isHome ? homeWon : !homeWon) ? ("W" as const) : ("L" as const);
    });
  }, [matches, team]);

  if (!team) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <ScreenHeader title="Team" showBack />
        <EmptyState icon="alert-circle-outline" title="Team not found" />
      </SafeAreaView>
    );
  }

  const competition = COMPETITIONS.find((c) => c.id === team.competitionId);
  const isFav = favouriteTeamIds.includes(team.id);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader
        title={team.name}
        subtitle={competition?.name}
        showBack
        onBack={() => router.back()}
        right={
          <Pressable onPress={() => toggleFavouriteTeam(team.id)} className="w-9 h-9 items-center justify-center">
            <Ionicons name={isFav ? "star" : "star-outline"} size={20} color={isFav ? colors.warn : colors.textTertiary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-5">
          <Card className="p-5 items-center mb-4">
            <TeamAvatar name={team.name} size={56} />
            <Text className="font-sans-bold text-[17px] mt-3">{team.name}</Text>
            <Text className="text-text-tertiary text-[12.5px] mt-1">
              {competition?.name} · {competition?.country}
            </Text>
            <View className="flex-row gap-1.5 mt-4">
              {recentForm.length === 0 ? (
                <Text className="text-text-tertiary text-[12px]">No match history yet</Text>
              ) : (
                recentForm.map((r, i) => (
                  <View
                    key={i}
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      r === "W" ? "bg-profit" : r === "L" ? "bg-loss" : "bg-text-tertiary"
                    }`}
                  >
                    <Text className="text-white text-[10px] font-sans-bold">{r}</Text>
                  </View>
                ))
              )}
            </View>
          </Card>

          <Text className="font-sans-semibold text-[15px] mb-2">Match history</Text>
          {matches.length === 0 ? (
            <Card>
              <EmptyState icon="calendar-outline" title="No matches in the dataset" />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {matches.slice(0, showCount).map((m, i) => {
                const isHome = m.home.id === team.id;
                const opponent = isHome ? m.away.name : m.home.name;
                const teamScore = isHome ? m.result.homeScore : m.result.awayScore;
                const oppScore = isHome ? m.result.awayScore : m.result.homeScore;
                const won = teamScore > oppScore;
                const drew = teamScore === oppScore;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => router.push(`/match/${m.id}`)}
                    className={`flex-row items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-text-tertiary text-[11px]">{formatDate(m.date)}</Text>
                      <Text className="text-text-primary text-[13px] font-sans-medium mt-0.5" numberOfLines={1}>
                        {isHome ? "vs" : "@"} {opponent}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <MonoText className="text-text-primary text-[14px] font-mono-medium">
                        {teamScore}-{oppScore}
                      </MonoText>
                      <View
                        className={`w-5 h-5 rounded-full items-center justify-center ${
                          won ? "bg-profit" : drew ? "bg-text-tertiary" : "bg-loss"
                        }`}
                      >
                        <Text className="text-white text-[9px] font-sans-bold">{won ? "W" : drew ? "D" : "L"}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </Card>
          )}
          {matches.length > showCount ? (
            <Pressable onPress={() => setShowCount((c) => c + 20)} className="py-3 items-center">
              <Text className="text-edge text-[13px] font-sans-medium">Show more matches</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
