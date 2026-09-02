import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Button } from "./Button";
import { colors } from "@/constants/theme";

export function EmptyState({
  icon = "file-tray-outline",
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center justify-center py-16 px-8">
      <View className="w-14 h-14 rounded-full bg-surfaceRaised border border-border items-center justify-center mb-4">
        <Ionicons name={icon} size={24} color={colors.textTertiary} />
      </View>
      <Text className="text-text-primary font-sans-semibold text-[15px] text-center">{title}</Text>
      {message ? <Text className="text-text-secondary text-[13px] text-center mt-1.5 leading-5">{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="sm" className="mt-5" />
      ) : null}
    </View>
  );
}

export function LoadingState({ message = "Loading" }: { message?: string }) {
  return (
    <View className="items-center justify-center py-20">
      <ActivityIndicator color={colors.edge} />
      <Text className="text-text-secondary text-[13px] mt-3">{message}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="items-center justify-center py-16 px-8">
      <View className="w-14 h-14 rounded-full bg-loss/10 border border-loss/30 items-center justify-center mb-4">
        <Ionicons name="warning-outline" size={24} color={colors.loss} />
      </View>
      <Text className="text-text-primary font-sans-semibold text-[15px] text-center">Something went wrong</Text>
      <Text className="text-text-secondary text-[13px] text-center mt-1.5 leading-5">{message}</Text>
      {onRetry ? <Button label="Try again" onPress={onRetry} size="sm" variant="secondary" className="mt-5" /> : null}
    </View>
  );
}
