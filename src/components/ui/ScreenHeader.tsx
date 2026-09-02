import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors } from "@/constants/theme";

export function ScreenHeader({
  title,
  subtitle,
  showBack,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
      <View className="flex-row items-center gap-3 flex-1">
        {showBack ? (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            hitSlop={10}
            className="w-9 h-9 rounded-full bg-surfaceRaised border border-border items-center justify-center"
          >
            <Ionicons name="chevron-back" size={19} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="font-sans-bold text-[22px] text-text-primary" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text className="text-text-secondary text-[13px] mt-0.5">{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}
