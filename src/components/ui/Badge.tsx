import React from "react";
import { View } from "react-native";
import { Text } from "./Text";

type BadgeTone = "profit" | "loss" | "neutral" | "warn" | "edge";

const toneClasses: Record<BadgeTone, string> = {
  profit: "bg-profit/15 border-profit/30",
  loss: "bg-loss/15 border-loss/30",
  warn: "bg-warn/15 border-warn/30",
  edge: "bg-edge/15 border-edge/30",
  neutral: "bg-surfaceRaised border-border",
};

const textClasses: Record<BadgeTone, string> = {
  profit: "text-profit",
  loss: "text-loss",
  warn: "text-warn",
  edge: "text-edge",
  neutral: "text-text-secondary",
};

export function Badge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  return (
    <View className={`self-start rounded-pill border px-2.5 py-1 ${toneClasses[tone]}`}>
      <Text className={`text-[11px] font-sans-semibold ${textClasses[tone]}`}>{label}</Text>
    </View>
  );
}

export function ResultBadge({ result }: { result: "won" | "lost" | "void" }) {
  const tone: BadgeTone = result === "won" ? "profit" : result === "lost" ? "loss" : "neutral";
  const label = result === "won" ? "Won" : result === "lost" ? "Lost" : "Void";
  return <Badge label={label} tone={tone} />;
}
