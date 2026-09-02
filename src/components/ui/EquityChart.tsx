import React, { useMemo, useState } from "react";
import { View, LayoutChangeEvent } from "react-native";
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import type { EquityPoint } from "@/types";
import { Text, MonoText } from "./Text";
import { colors } from "@/constants/theme";
import { formatCurrency, formatDate } from "@/utils/format";

interface Props {
  data: EquityPoint[];
  height?: number;
  startingBankroll: number;
}

export function EquityChart({ data, height = 180, startingBankroll }: Props) {
  const [width, setWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const { path, areaPath, points, min, max, color } = useMemo(() => {
    if (data.length === 0 || width === 0) {
      return { path: "", areaPath: "", points: [] as { x: number; y: number }[], min: 0, max: 0, color: colors.edge };
    }
    const values = data.map((d) => d.bankroll);
    const min = Math.min(...values, startingBankroll);
    const max = Math.max(...values, startingBankroll);
    const range = max - min || 1;
    const padY = 14;
    const usableH = height - padY * 2;
    const stepX = data.length > 1 ? width / (data.length - 1) : width;

    const points = data.map((d, i) => ({
      x: i * stepX,
      y: padY + usableH - ((d.bankroll - min) / range) * usableH,
    }));

    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const areaPath = `${path} L ${points[points.length - 1].x.toFixed(1)} ${height} L 0 ${height} Z`;

    const final = data[data.length - 1].bankroll;
    const color = final >= startingBankroll ? colors.profit : colors.loss;

    return { path, areaPath, points, min, max, color };
  }, [data, width, height, startingBankroll]);

  function updateActive(localX: number) {
    if (points.length === 0 || width === 0) return;
    const stepX = points.length > 1 ? width / (points.length - 1) : width;
    const idx = Math.min(points.length - 1, Math.max(0, Math.round(localX / stepX)));
    setActiveIdx(idx);
  }

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const active = activeIdx !== null ? data[activeIdx] : null;
  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <View>
      {active ? (
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-text-tertiary text-xs">{formatDate(active.date)}</Text>
          <MonoText className="text-[13px] font-mono-medium" style={{ color }}>
            {formatCurrency(active.bankroll)}
          </MonoText>
        </View>
      ) : (
        <View className="h-[18px]" />
      )}
      <View
        onLayout={onLayout}
        style={{ height }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => updateActive(e.nativeEvent.locationX)}
        onResponderMove={(e) => updateActive(e.nativeEvent.locationX)}
        onResponderRelease={() => setActiveIdx(null)}
      >
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.25} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={areaPath} fill="url(#fillGrad)" />
            <Path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            {activePoint && (
              <>
                <Line
                  x1={activePoint.x}
                  y1={0}
                  x2={activePoint.x}
                  y2={height}
                  stroke={colors.borderStrong}
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <Circle cx={activePoint.x} cy={activePoint.y} r={4.5} fill={color} stroke={colors.canvas} strokeWidth={2} />
              </>
            )}
          </Svg>
        )}
      </View>
    </View>
  );
}
