import { createModifier, type ModifierConfig } from '@expo/ui/jetpack-compose/modifiers';

export const videoFrameDecoderComposeModifier = (params: {
  color?: number;
  width?: number;
  cornerRadius?: number;
}): ModifierConfig => createModifier('videoFrameDecoderComposeModifier', params);
