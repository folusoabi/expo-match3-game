import { NativeModule, requireNativeModule } from 'expo';

import { VideoFrameDecoderModuleEvents } from './VideoFrameDecoder.types';
import type { VideoFrameDecoderModuleSharedObject } from './VideoFrameDecoderModuleSharedObject';

declare class VideoFrameDecoderModule extends NativeModule<VideoFrameDecoderModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  VideoFrameDecoderModuleSharedObject: typeof VideoFrameDecoderModuleSharedObject;
}

export default requireNativeModule<VideoFrameDecoderModule>('VideoFrameDecoder');
