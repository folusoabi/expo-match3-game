import React, { useMemo, useRef, useEffect } from "react";
import { ScrollView, Pressable, View } from "react-native";
import { Text } from "./Text";

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayLabel(iso: string): { top: string; bottom: string } {
  const d = new Date(iso);
  return {
    top: d.toLocaleDateString(undefined, { weekday: "short" }),
    bottom: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  };
}

/** Horizontal strip of dates centered on `selected`, for browsing historical fixtures. */
export function DatePager({
  selected,
  onSelect,
  windowSize = 10,
  datesWithMatches,
}: {
  selected: string;
  onSelect: (iso: string) => void;
  windowSize?: number;
  /** Optional set of ISO dates that have matches, to show a small dot indicator. */
  datesWithMatches?: Set<string>;
}) {
  const dates = useMemo(
    () => Array.from({ length: windowSize * 2 + 1 }, (_, i) => addDays(selected, i - windowSize)),
    [selected, windowSize]
  );
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: windowSize * 66, animated: false });
  }, [selected, windowSize]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      {dates.map((d) => {
        const active = d === selected;
        const label = dayLabel(d);
        const hasMatches = datesWithMatches?.has(d);
        return (
          <Pressable
            key={d}
            onPress={() => onSelect(d)}
            className={`items-center justify-center rounded-xl px-3.5 py-2 border ${
              active ? "bg-edge border-edge" : "bg-surface border-border"
            }`}
          >
            <Text className={`text-[11px] ${active ? "text-white" : "text-text-tertiary"} font-sans-medium`}>{label.top}</Text>
            <Text className={`text-[13px] mt-0.5 ${active ? "text-white" : "text-text-primary"} font-sans-semibold`}>
              {label.bottom}
            </Text>
            {hasMatches ? (
              <View className={`w-1 h-1 rounded-full mt-1 ${active ? "bg-white" : "bg-edge"}`} />
            ) : (
              <View className="w-1 h-1 mt-1" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
