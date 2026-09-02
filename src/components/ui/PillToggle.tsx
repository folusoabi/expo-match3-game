import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Text";

interface Option {
  label: string;
  value: string;
}

export function PillToggle({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="flex-row bg-surfaceInset rounded-pill p-1 self-start">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`px-5 py-2 rounded-pill ${active ? "bg-text-primary" : ""}`}
          >
            <Text className={`text-[12.5px] font-sans-bold tracking-wide ${active ? "text-white" : "text-text-secondary"}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
