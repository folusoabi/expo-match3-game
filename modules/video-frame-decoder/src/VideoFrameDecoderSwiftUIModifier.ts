import { createModifier, type ModifierConfig } from '@expo/ui/swift-ui/modifiers';

export const videoFrameDecoderSwiftUIModifier = (params: {
  color?: string;
  width?: number;
  cornerRadius?: number;
}): ModifierConfig => createModifier('videoFrameDecoderSwiftUIModifier', params);
