import { SharedObject, useReleasingSharedObject } from 'expo-modules-core';

import VideoFrameDecoderModule from './VideoFrameDecoderModule';

export declare class VideoFrameDecoderModuleSharedObject extends SharedObject {
  count: number;
}

/**
 * Creates a new VideoFrameDecoderModuleSharedObject instance.
 * You are responsible for releasing it from memory by calling `release()` when done.
 */
export function createVideoFrameDecoderModuleSharedObject(): VideoFrameDecoderModuleSharedObject {
  return new VideoFrameDecoderModule.VideoFrameDecoderModuleSharedObject();
}

/**
 * A hook that creates a VideoFrameDecoderModuleSharedObject instance and automatically
 * releases it when the component unmounts.
 */
export function useVideoFrameDecoderModuleSharedObject(): VideoFrameDecoderModuleSharedObject {
  return useReleasingSharedObject(() => new VideoFrameDecoderModule.VideoFrameDecoderModuleSharedObject(), []);
}
