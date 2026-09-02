import React from "react";
import { Modal, Pressable, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./Text";
import { colors } from "@/constants/theme";

export interface SelectSheetOption {
  label: string;
  value: string;
  sublabel?: string;
}

interface Props {
  visible: boolean;
  title: string;
  options: SelectSheetOption[];
  selected: string | string[];
  multi?: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SelectSheet({ visible, title, options, selected, multi, onSelect, onClose }: Props) {
  const isSelected = (value: string) => (multi ? (selected as string[]).includes(value) : selected === value);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <SafeAreaView edges={["bottom"]} className="bg-surfaceRaised rounded-t-2xl border-t border-x border-border max-h-[75%]">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-border">
            <Text className="font-sans-semibold text-[15px]">{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView className="px-2" contentContainerStyle={{ paddingVertical: 6, paddingBottom: 20 }}>
            {options.map((opt) => {
              const active = isSelected(opt.value);
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => onSelect(opt.value)}
                  className={`flex-row items-center justify-between px-3.5 py-3.5 rounded-lg mb-0.5 ${active ? "bg-edge/10" : ""}`}
                >
                  <View>
                    <Text className={`text-[14.5px] ${active ? "text-edge font-sans-semibold" : "text-text-primary font-sans"}`}>
                      {opt.label}
                    </Text>
                    {opt.sublabel ? <Text className="text-text-tertiary text-xs mt-0.5">{opt.sublabel}</Text> : null}
                  </View>
                  {active ? <Ionicons name="checkmark-circle" size={20} color={colors.edge} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
