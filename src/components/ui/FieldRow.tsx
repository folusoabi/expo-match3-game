import React from "react";
import { Pressable, View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Label } from "./Text";
import { colors } from "@/constants/theme";

export function FieldRow({
  label,
  value,
  onPress,
  icon,
}: {
  label: string;
  value: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3.5 border-b border-border"
    >
      <View className="flex-row items-center gap-2.5">
        {icon ? <Ionicons name={icon} size={16} color={colors.textSecondary} /> : null}
        <Text className="text-text-secondary text-[13.5px] font-sans-medium">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-text-primary text-[13.5px] font-sans-medium" numberOfLines={1}>
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

export function NumberFieldRow({
  label,
  value,
  onChangeText,
  suffix,
  icon,
  keyboardType = "decimal-pad",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suffix?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: "decimal-pad" | "number-pad";
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
      <View className="flex-row items-center gap-2.5">
        {icon ? <Ionicons name={icon} size={16} color={colors.textSecondary} /> : null}
        <Text className="text-text-secondary text-[13.5px] font-sans-medium">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          className="text-text-primary font-mono-medium text-[14px] text-right min-w-[56px]"
        />
        {suffix ? <Text className="text-text-tertiary text-[13px]">{suffix}</Text> : null}
      </View>
    </View>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Label className="px-4 pt-5 pb-2 uppercase">{children}</Label>;
}
