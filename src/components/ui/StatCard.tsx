import React from "react";
import { View } from "react-native";
import { Card } from "./Card";
import { Text, MonoText, Label } from "./Text";

interface StatCardProps {
  label: string;
  value: string;
  tone?: "profit" | "loss" | "neutral" | "warn";
  sublabel?: string;
  className?: string;
}

const toneClass: Record<string, string> = {
  profit: "text-profit",
  loss: "text-loss",
  warn: "text-warn",
  neutral: "text-text-primary",
};

export function StatCard({ label, value, tone = "neutral", sublabel, className = "" }: StatCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <Label>{label}</Label>
      <MonoText className={`text-[22px] mt-1.5 font-mono-medium ${toneClass[tone]}`}>{value}</MonoText>
      {sublabel ? <Text className="text-text-tertiary text-xs mt-1">{sublabel}</Text> : null}
    </Card>
  );
}

export function StatRow({ label, value, tone = "neutral", isLast }: StatCardProps & { isLast?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between py-2.5 ${isLast ? "" : "border-b border-border"}`}>
      <Text className="text-text-secondary text-[13px]">{label}</Text>
      <MonoText className={`text-[13px] font-mono-medium ${toneClass[tone]}`}>{value}</MonoText>
    </View>
  );
}
