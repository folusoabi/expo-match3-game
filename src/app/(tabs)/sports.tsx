import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/theme";
import { SPORTS } from "@/data/mock/reference";
import { competitionsByCountry } from "@/data/mock/reference";
import type { SportId } from "@/types";

export default function SportsScreen() {
  const [sportId, setSportId] = useState<SportId>("football");
  const groups = useMemo(() => competitionsByCountry(sportId), [sportId]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <View className="px-5 pt-2 pb-3">
        <Text className="font-sans-bold text-[22px] text-text-primary">Sports</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }} className="mb-4">
        {SPORTS.map((s) => {
          const active = s.id === sportId;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSportId(s.id)}
              className={`flex-row items-center gap-2 rounded-pill px-4 py-2.5 border ${
                active ? "bg-text-primary border-text-primary" : "bg-surface border-border"
              }`}
            >
              <Ionicons name={s.icon as keyof typeof Ionicons.glyphMap} size={15} color={active ? "#fff" : colors.textSecondary} />
              <Text className={`text-[13px] font-sans-semibold ${active ? "text-white" : "text-text-secondary"}`}>{s.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {groups.map((g) => (
          <View key={g.country} className="mb-5">
            <Text className="text-text-tertiary text-[12px] font-sans-semibold uppercase tracking-wide mb-2 px-1">
              {g.country}
            </Text>
            <Card>
              {g.competitions.map((c, i) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/competition/${c.id}`)}
                  className={`flex-row items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-edge/10 items-center justify-center">
                      <Ionicons name="trophy" size={14} color={colors.edge} />
                    </View>
                    <Text className="text-text-primary text-[14px] font-sans-medium">{c.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </Pressable>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
