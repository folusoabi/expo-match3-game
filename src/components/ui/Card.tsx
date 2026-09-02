import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  raised?: boolean;
  inset?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ raised, inset, className = "", style, ...rest }: CardProps) {
  const bg = inset ? "bg-surfaceInset" : raised ? "bg-surfaceRaised" : "bg-surface";
  return (
    <View
      className={`${bg} border border-border rounded-card ${className}`}
      style={style}
      {...rest}
    />
  );
}
