import React, { useMemo } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { EmptyState } from "@/components/ui/States";
import { colors } from "@/constants/theme";
import { useApp } from "@/state/AppProvider";
import { findTeamById } from "@/data/mock/eventGenerator";
import { COMPETITIONS } from "@/data/mock/reference";

export default function FavouritesScreen() {
  const { favouriteTeamIds, toggleFavouriteTeam } = useApp();
  const teams = useMemo(() => favouriteTeamIds.map((id) => findTeamById(id)).filter(Boolean), [favouriteTeamIds]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title="Favourite Teams" showBack onBack={() => router.back()} />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {teams.length === 0 ? (
          <Card>
            <EmptyState icon="star-outline" title="No favourites yet" message="Tap the star on any match to follow a team here." />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {teams.map((t, i) => {
              const competition = COMPETITIONS.find((c) => c.id === t!.competitionId);
              return (
                <Pressable
                  key={t!.id}
                  onPress={() => router.push(`/team/${t!.id}`)}
                  className={`flex-row items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <View className="flex-row items-center gap-3">
                    <TeamAvatar name={t!.name} size={32} />
                    <View>
                      <Text className="text-text-primary text-[14px] font-sans-medium">{t!.name}</Text>
                      <Text className="text-text-tertiary text-[11.5px] mt-0.5">{competition?.name}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => toggleFavouriteTeam(t!.id)} hitSlop={8}>
                    <Ionicons name="star" size={18} color={colors.warn} />
                  </Pressable>
                </Pressable>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
