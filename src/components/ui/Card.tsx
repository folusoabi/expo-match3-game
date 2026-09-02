import React from "react";
import { View, ViewProps, Platform } from "react-native";

interface CardProps extends ViewProps {
  raised?: boolean;
  inset?: boolean;
  bordered?: boolean;
  flat?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: { elevation: 1.5 },
  default: {},
});

/**
 * Sofascore-style white card floating on the light grey canvas, separated
 * by a soft shadow rather than a heavy border. `bordered` opts into a
 * hairline edge instead (useful inside another card). `flat` drops the
 * shadow entirely for nested/inline use.
 */
export function Card({ raised, inset, bordered, flat, className = "", style, ...rest }: CardProps) {
  const bg = inset ? "bg-surfaceInset" : "bg-surface";
  const border = bordered ? "border border-border" : "";
  return (
    <View
      className={`${bg} ${border} rounded-card ${className}`}
      style={[flat ? undefined : shadowStyle, style]}
      {...rest}
    />
  );
}
