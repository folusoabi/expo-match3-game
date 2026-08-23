import { requireNativeView } from 'expo';
import * as React from 'react';

import { VideoFrameDecoderViewProps } from './VideoFrameDecoder.types';

const NativeView: React.ComponentType<VideoFrameDecoderViewProps> = requireNativeView('VideoFrameDecoder');

export default function VideoFrameDecoderView(props: VideoFrameDecoderViewProps) {
  return <NativeView {...props} />;
}
