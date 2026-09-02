import React from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { avatarColorFor } from "@/constants/theme";

function initials(name: string): string {
  const parts = name.replace(/[.,]/g, "").split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TeamAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const color = avatarColorFor(name);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${color}26`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color, fontSize: size * 0.36 }} className="font-sans-bold">
        {initials(name)}
      </Text>
    </View>
  );
}
