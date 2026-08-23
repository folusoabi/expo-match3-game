import { registerWebModule, NativeModule } from 'expo';

import { VideoFrameDecoderModuleEvents } from './VideoFrameDecoder.types';

class VideoFrameDecoderModule extends NativeModule<VideoFrameDecoderModuleEvents> {
  PI = Math.PI;

  hello() {
    return 'Hello world! 👋';
  }

  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
}

export default registerWebModule(VideoFrameDecoderModule, 'VideoFrameDecoderModule');
