import React, { useState } from "react";
import { Modal, Pressable, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./Text";
import { colors } from "@/constants/theme";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function YearMonthPicker({
  visible,
  years,
  initialYear,
  initialMonth,
  onSelect,
  onClose,
}: {
  visible: boolean;
  years: number[];
  initialYear: number;
  initialMonth: number; // 1-12
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}) {
  const [year, setYear] = useState(initialYear);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <SafeAreaView edges={["bottom"]} className="bg-surface rounded-t-2xl border-t border-border">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-border">
            <Text className="font-sans-semibold text-[15px]">Jump to a date</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 14 }}>
            {years.map((y) => {
              const active = y === year;
              return (
                <Pressable
                  key={y}
                  onPress={() => setYear(y)}
                  className={`rounded-pill px-4 py-2 border ${active ? "bg-text-primary border-text-primary" : "bg-surface border-border"}`}
                >
                  <Text className={`text-[13.5px] font-sans-bold ${active ? "text-white" : "text-text-secondary"}`}>{y}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="flex-row flex-wrap px-4 pb-6">
            {MONTHS.map((m, idx) => (
              <View key={m} style={{ width: "25%" }} className="p-1.5">
                <Pressable
                  onPress={() => onSelect(year, idx + 1)}
                  className="bg-surfaceInset rounded-xl py-3.5 items-center"
                >
                  <Text className="text-text-primary text-[13px] font-sans-semibold">{m}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
