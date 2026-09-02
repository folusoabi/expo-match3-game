import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { Text } from "./ui/Text";
import { TeamAvatar } from "./ui/TeamAvatar";
import { colors } from "@/constants/theme";
import type { Competition, Match } from "@/types";

export function kickoffTime(matchId: string): string {
  let h = 0;
  for (let i = 0; i < matchId.length; i++) h = (h * 31 + matchId.charCodeAt(i)) >>> 0;
  const hour = 11 + (h % 10); // 11:00–20:xx
  const minute = (h >> 3) % 4 === 0 ? 0 : ((h >> 3) % 4) * 15;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

export function MatchRow({ match, onPress }: { match: Match; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <View className="flex-row items-center px-4 py-3">
        <View className="w-14">
          <Text className="text-text-tertiary text-[11px] font-sans-medium">{kickoffTime(match.id)}</Text>
        </View>
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2.5">
            <TeamAvatar name={match.home.name} size={22} />
            <Text className="text-text-primary text-[13.5px] font-sans-medium flex-1" numberOfLines={1}>
              {match.home.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-2.5">
            <TeamAvatar name={match.away.name} size={22} />
            <Text className="text-text-primary text-[13.5px] font-sans-medium flex-1" numberOfLines={1}>
              {match.away.name}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

export function CompetitionSection({
  competition,
  matches,
  onSelectMatch,
  defaultOpen = true,
}: {
  competition: Competition;
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (matches.length === 0) return null;

  return (
    <Card className="mb-3 overflow-hidden">
      <Pressable onPress={() => setOpen((v) => !v)} className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-2.5">
          <View className="w-6 h-6 rounded-full bg-edge/10 items-center justify-center">
            <Ionicons name="trophy" size={12} color={colors.edge} />
          </View>
          <View>
            <Text className="text-text-primary text-[13.5px] font-sans-semibold">{competition.name}</Text>
            <Text className="text-text-tertiary text-[11px]">{competition.country}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-text-tertiary text-[11px]">{matches.length} matches</Text>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={15} color={colors.textTertiary} />
        </View>
      </Pressable>
      {open ? (
        <View className="border-t border-border">
          {matches.map((m, i) => (
            <View key={m.id} className={i > 0 ? "border-t border-border" : ""}>
              <MatchRow match={m} onPress={() => onSelectMatch(m)} />
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
