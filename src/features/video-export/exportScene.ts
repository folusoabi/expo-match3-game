// Renders a Scene to an mp4 entirely on-device (no network, no ffmpeg).
// Uses @azzapp/react-native-skia-video's exportVideoComposition, which
// drives the native encoder (MediaCodec on Android, AVAssetWriter on iOS)
// frame-by-frame from a Skia drawFrame callback.
//
// NOTE: @azzapp/react-native-skia-video is normally used to composite
// existing video clips (its `items` list references source videos). We're
// not compositing any source video, so `items` is left empty and all the
// drawing happens procedurally inside `drawFrame`, using currentTime to
// look up interpolated layer values from the Scene.
//
// The exact imperative canvas method names (drawText/drawImageRect/etc.)
// can drift slightly between react-native-skia versions -- if TypeScript
// flags anything here after `npx expo install`, check the installed
// version's canvas API and adjust the calls; the shape of the Scene model
// itself won't need to change.

import { Skia } from '@shopify/react-native-skia';
import { exportVideoComposition } from '@azzapp/react-native-skia-video';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import type { Scene, Layer } from './scene';
import { interpolateNumber, interpolateVec2 } from './scene';

export interface ExportProgress {
  fractionComplete: number; // 0..1
}

export async function exportSceneToVideo(
  scene: Scene,
  onProgress?: (p: ExportProgress) => void
): Promise<string> {
  const outPath = `${FileSystem.cacheDirectory}scene-${scene.id}-${Date.now()}.mp4`;

  const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(
    await loadFontData(require('../../../assets/fonts/Inter-Bold.ttf'))
  );
  const fontCache = new Map<number, ReturnType<typeof Skia.Font>>();
  const fontFor = (size: number) => {
    if (!fontCache.has(size)) {
      fontCache.set(size, Skia.Font(typeface, size));
    }
    return fontCache.get(size)!;
  };

  // Pre-decode any real (non-placeholder) images referenced by image layers.
  const imageCache = new Map<string, ReturnType<typeof Skia.Image.MakeImageFromEncoded>>();
  for (const layer of scene.layers) {
    if (layer.type === 'image' && layer.uri) {
      const base64 = await FileSystem.readAsStringAsync(layer.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const skData = Skia.Data.fromBase64(base64);
      imageCache.set(layer.uri, Skia.Image.MakeImageFromEncoded(skData));
    }
  }

  const fps = 30;

  await exportVideoComposition({
    videoComposition: { duration: scene.durationSeconds, items: [] },
    width: scene.width,
    height: scene.height,
    frameRate: fps,
    bitRate: 6_000_000,
    outPath,
    drawFrame: ({ canvas, currentTime }) => {
      'worklet';
      canvas.clear(Skia.Color(scene.backgroundColor));
      drawLayers(canvas, scene.layers, currentTime, fontFor, imageCache);
      onProgress?.({ fractionComplete: Math.min(1, currentTime / scene.durationSeconds) });
    },
  });

  return outPath;
}

function drawLayers(
  canvas: any,
  layers: Layer[],
  t: number,
  fontFor: (size: number) => any,
  imageCache: Map<string, any>
) {
  'worklet';
  for (const layer of layers) {
    const pos = interpolateVec2(layer.position, t);
    const opacity = interpolateNumber(layer.opacity, t);
    const scale = interpolateNumber(layer.scale, t);
    if (opacity <= 0) continue;

    if (layer.type === 'text') {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color(layer.color));
      paint.setAlphaf(opacity);
      const font = fontFor(layer.fontSize);
      canvas.save();
      canvas.translate(pos.x, pos.y);
      canvas.scale(scale, scale);
      canvas.drawText(layer.text, 0, 0, paint, font);
      canvas.restore();
    } else {
      canvas.save();
      canvas.translate(pos.x, pos.y);
      canvas.scale(scale, scale);

      const rr = Skia.RRectXY(
        Skia.XYWHRect(0, 0, layer.width, layer.height),
        layer.cornerRadius,
        layer.cornerRadius
      );
      const image = layer.uri ? imageCache.get(layer.uri) : null;

      if (image) {
        canvas.save();
        canvas.clipRRect(rr, true);
        const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
        const dstRect = Skia.XYWHRect(0, 0, layer.width, layer.height);
        const paint = Skia.Paint();
        paint.setAlphaf(opacity);
        canvas.drawImageRect(image, srcRect, dstRect, paint);
        canvas.restore();
      } else {
        const fillPaint = Skia.Paint();
        fillPaint.setColor(Skia.Color('#2A2A35'));
        fillPaint.setAlphaf(opacity);
        canvas.drawRRect(rr, fillPaint);
      }
      canvas.restore();
    }
  }
}

async function loadFontData(mod: number): Promise<ArrayBuffer> {
  const asset = Asset.fromModule(mod);
  await asset.downloadAsync();
  const b64 = await FileSystem.readAsStringAsync(asset.localUri!, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = globalThis.atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
