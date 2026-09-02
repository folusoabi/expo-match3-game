import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { sportColor, sportIcons } from "@/constants/theme";
import type { SportId } from "@/types";

export function SportTag({ sportId, label }: { sportId: SportId; label?: string }) {
  const color = sportColor(sportId);
  const icon = (sportIcons[sportId] ?? "ellipse") as keyof typeof Ionicons.glyphMap;
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ backgroundColor: `${color}22` }} className="w-6 h-6 rounded-full items-center justify-center">
        <Ionicons name={icon} size={12} color={color} />
      </View>
      {label ? <Text className="text-text-secondary text-[12.5px] font-sans-medium">{label}</Text> : null}
    </View>
  );
}

export function SportDot({ sportId, size = 8 }: { sportId: SportId; size?: number }) {
  return (
    <View
      style={{ backgroundColor: sportColor(sportId), width: size, height: size, borderRadius: size / 2 }}
    />
  );
}
