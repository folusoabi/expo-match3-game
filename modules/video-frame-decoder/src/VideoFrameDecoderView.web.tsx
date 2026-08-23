import * as React from 'react';

import { VideoFrameDecoderViewProps } from './VideoFrameDecoder.types';

export default function VideoFrameDecoderView(props: VideoFrameDecoderViewProps) {
  return (
    <div
      style={{
        backgroundColor: '#aabbcc',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => props.onTap({ nativeEvent: {} })}>
      <span>VideoFrameDecoder - native view</span>
      <span>Tap the view to emit a view event</span>
    </div>
  );
}
