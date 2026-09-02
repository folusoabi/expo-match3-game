import React from "react";
import { Pressable, ActivityIndicator, PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors } from "@/constants/theme";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  icon,
  loading,
  fullWidth,
  disabled,
  className = "",
  ...rest
}: ButtonProps & { className?: string }) {
  const base = "flex-row items-center justify-center rounded-lg";
  const pad = size === "sm" ? "px-3.5 py-2.5" : "px-5 py-3.5";
  const variantClass =
    variant === "primary"
      ? "bg-edge"
      : variant === "danger"
      ? "bg-loss/15 border border-loss/40"
      : variant === "secondary"
      ? "bg-surfaceRaised border border-border"
      : "bg-transparent";
  const textClass =
    variant === "primary"
      ? "text-white font-sans-semibold"
      : variant === "danger"
      ? "text-loss font-sans-semibold"
      : "text-text-primary font-sans-semibold";
  const iconColor = variant === "primary" ? "#FFFFFF" : variant === "danger" ? colors.loss : colors.textPrimary;

  return (
    <Pressable
      disabled={disabled || loading}
      className={`${base} ${pad} ${variantClass} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-40" : ""} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={size === "sm" ? 15 : 17} color={iconColor} style={{ marginRight: 7 }} /> : null}
          <Text className={`${textClass} ${size === "sm" ? "text-[13px]" : "text-[15px]"}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
