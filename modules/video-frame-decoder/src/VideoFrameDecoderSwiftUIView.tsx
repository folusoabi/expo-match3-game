import { requireNativeView } from 'expo';
import { type CommonViewModifierProps } from '@expo/ui/swift-ui';
import { createViewModifierEventListener } from '@expo/ui/swift-ui/modifiers';
import * as React from 'react';

export interface VideoFrameDecoderSwiftUIViewProps extends CommonViewModifierProps {
  title: string;
  children?: React.ReactNode;
}

const NativeVideoFrameDecoderSwiftUIView = requireNativeView<VideoFrameDecoderSwiftUIViewProps>(
  'VideoFrameDecoder',
  'VideoFrameDecoderSwiftUIView'
);

export default function VideoFrameDecoderSwiftUIView({
  modifiers,
  ...rest
}: VideoFrameDecoderSwiftUIViewProps) {
  return (
    <NativeVideoFrameDecoderSwiftUIView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...rest}
    />
  );
}
