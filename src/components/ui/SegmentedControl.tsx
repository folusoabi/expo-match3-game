import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Text";

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className = "" }: Props) {
  return (
    <View className={`flex-row bg-surfaceInset border border-border rounded-lg p-1 ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`flex-1 items-center justify-center py-2 rounded-md ${active ? "bg-surfaceRaised border border-borderStrong" : ""}`}
          >
            <Text className={`text-[12.5px] ${active ? "text-text-primary font-sans-semibold" : "text-text-secondary font-sans"}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
