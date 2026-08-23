import { requireNativeView } from 'expo';
import { type PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import * as React from 'react';

export interface VideoFrameDecoderComposeViewProps extends PrimitiveBaseProps {
  title: string;
  children?: React.ReactNode;
}

const NativeVideoFrameDecoderComposeView = requireNativeView<VideoFrameDecoderComposeViewProps>(
  'VideoFrameDecoder',
  'VideoFrameDecoderComposeView'
);

export default function VideoFrameDecoderComposeView({
  modifiers,
  ...rest
}: VideoFrameDecoderComposeViewProps) {
  return (
    <NativeVideoFrameDecoderComposeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...rest}
    />
  );
}
