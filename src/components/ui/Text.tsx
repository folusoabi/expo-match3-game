import React from "react";
import { Text as RNText, TextProps } from "react-native";

interface Props extends TextProps {
  className?: string;
  children?: React.ReactNode;
}

export function Text({ className = "", style, ...rest }: Props) {
  return <RNText className={`font-sans text-text-primary ${className}`} style={style} {...rest} />;
}

export function MonoText({ className = "", style, ...rest }: Props) {
  return <RNText className={`font-mono text-text-primary ${className}`} style={style} {...rest} />;
}

export function Label({ className = "", style, ...rest }: Props) {
  return (
    <RNText
      className={`font-sans-medium text-text-secondary text-[11px] tracking-wide ${className}`}
      style={style}
      {...rest}
    />
  );
}
